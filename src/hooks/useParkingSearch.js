import { useCallback, useRef } from 'react';
import { apiLimiter } from '@/services/apiLimiter';

const MIN_SEARCH_INTERVAL = 3000; // Aumentado a 3 segundos entre búsquedas
const MIN_DISTANCE_FOR_NEW_SEARCH = 100; // Aumentado a 100 metros
const MAP_MOVEMENT_DEBOUNCE = 1000; // 1 segundo de debounce para movimiento del mapa
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos de expiración del caché

const SEARCH_RADIUS = {
  VERY_CLOSE: 300, // 300 metros para zoom muy cercano
  CLOSE: 800, // 800 metros para zoom cercano
  MEDIUM: 1500, // 1.5 km para zoom medio
  FAR: 2500 // 2.5 km para zoom lejano
};

const FIELDS_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.currentOpeningHours.openNow',
  'places.businessStatus',
  'places.types',
  'places.photos'
].join(',');

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const debug = (message, data) => {
  if (import.meta.env.DEV) {
    console.log(`🔍 [ParkingSearch] ${message}`, data || '');
  }
};

const validateCoordinates = (lat, lng) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  return !isNaN(parsedLat) &&
         !isNaN(parsedLng) &&
         parsedLat >= -90 &&
         parsedLat <= 90 &&
         parsedLng >= -180 &&
         parsedLng <= 180;
};

const calculateDistance = (point1, point2) => {
  if (!point1?.lat || !point1?.lng || !point2?.lat || !point2?.lng) {
    return Infinity;
  }

  try {
    if (!window.google?.maps?.geometry?.spherical) {
      return Infinity;
    }

    const p1 = new window.google.maps.LatLng(
      parseFloat(point1.lat),
      parseFloat(point1.lng)
    );
    const p2 = new window.google.maps.LatLng(
      parseFloat(point2.lat),
      parseFloat(point2.lng)
    );

    return window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
  } catch (error) {
    debug('Error calculando distancia:', error);
    return Infinity;
  }
};

export const useParkingSearch = (setParkingSpots, getCachedResult, setCachedResult) => {
  if (!setParkingSpots || !getCachedResult || !setCachedResult) {
    throw new Error('useParkingSearch requiere setParkingSpots, getCachedResult y setCachedResult');
  }

  const lastSearchLocationRef = useRef(null);
  const lastSearchTime = useRef(0);
  const isSearchingRef = useRef(false);
  const searchQueueRef = useRef([]);
  const processingQueueRef = useRef(false);
  const mapMovementTimeoutRef = useRef(null);
  const lastCachedLocationRef = useRef(null);
  const lastCacheTimeRef = useRef(0);

  // Función para verificar si el caché es válido
  const isCacheValid = useCallback((location) => {
    if (!lastCachedLocationRef.current || !lastCacheTimeRef.current) return false;

    const timeSinceLastCache = Date.now() - lastCacheTimeRef.current;
    if (timeSinceLastCache > CACHE_EXPIRY) return false;

    const distance = calculateDistance(location, lastCachedLocationRef.current);
    return distance < MIN_DISTANCE_FOR_NEW_SEARCH;
  }, []);

  // Función para actualizar el caché
  const updateCache = useCallback((location, spots) => {
    lastCachedLocationRef.current = location;
    lastCacheTimeRef.current = Date.now();
    setCachedResult(location, spots);
  }, [setCachedResult]);

  // Función para realizar la búsqueda real
  const performSearch = useCallback(async (location, zoom, isMapMoving) => {
    if (!location?.lat || !location?.lng || !validateCoordinates(location.lat, location.lng)) {
      debug('❌ Búsqueda cancelada - Parámetros inválidos');
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      debug('API Key de Google Maps no encontrada');
      return;
    }

    if (isSearchingRef.current) {
      debug('Búsqueda en progreso, omitiendo nueva búsqueda');
      return;
    }

    const currentLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    };

    // Si el mapa está en movimiento, actualizar la última ubicación y retornar
    if (isMapMoving) {
      lastSearchLocationRef.current = currentLocation;
      return;
    }

    // Verificar caché válido
    if (isCacheValid(currentLocation)) {
      debug('Usando caché válido');
      const cachedResults = getCachedResult(currentLocation);
      if (cachedResults?.length > 0) {
        setParkingSpots(cachedResults);
        return;
      }
    }

    // Verificar rate limit
    if (!apiLimiter.canMakeCall()) {
      debug('Rate limit alcanzado, usando caché');
      const cachedResults = getCachedResult(currentLocation);
      if (cachedResults?.length > 0) {
        setParkingSpots(cachedResults);
        return;
      }
    }

    // Verificar distancia mínima
    if (lastSearchLocationRef.current) {
      const distance = calculateDistance(currentLocation, lastSearchLocationRef.current);
      if (distance < MIN_DISTANCE_FOR_NEW_SEARCH) {
        debug('Ubicación muy cercana a la última búsqueda');
        const cachedResults = getCachedResult(currentLocation);
        if (cachedResults?.length > 0) {
          setParkingSpots(cachedResults);
          return;
        }
      }
    }

    try {
      isSearchingRef.current = true;
      debug('Iniciando búsqueda en Places API', { location: currentLocation, zoom });

      apiLimiter.logCall(currentLocation);

      // Ajustar el radio de búsqueda según el nivel de zoom
      let searchRadius;
      if (zoom >= 18) {
        searchRadius = SEARCH_RADIUS.VERY_CLOSE;
      } else if (zoom >= 16) {
        searchRadius = SEARCH_RADIUS.CLOSE;
      } else if (zoom >= 14) {
        searchRadius = SEARCH_RADIUS.MEDIUM;
      } else {
        searchRadius = SEARCH_RADIUS.FAR;
      }

      const requestBody = {
        includedTypes: ['parking'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: currentLocation.lat,
              longitude: currentLocation.lng
            },
            radius: searchRadius
          }
        },
        languageCode: "es"
      };

      debug('Request body:', requestBody);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': FIELDS_MASK,
          'Accept-Language': 'es'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (!data.places) {
        debug('❌ No se encontraron lugares en la respuesta');
        return;
      }

      const googlePlacesSpots = data.places.map(place => ({
        id: `google_${place.id}_${Date.now()}`,
        googlePlaceId: place.id,
        name: place.displayName?.text || 'Parqueadero',
        address: place.formattedAddress,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        isGooglePlace: true,
        available_spaces: place.currentOpeningHours?.openNow ? 1 : 0,
        total_spaces: 1,
        min_price: 0,
        max_price: 0,
        price_per_hour: 0,
        is_open: place.currentOpeningHours?.openNow ?? true,
        rating: place.rating || 0,
        userRatingCount: place.userRatingTotal || 0,
        businessStatus: place.businessStatus || 'OPERATIONAL',
        lastUpdated: Date.now(),
        vicinity: place.formattedAddress,
        types: place.types || ['parking'],
        photos: place.photos || [],
        openNow: place.currentOpeningHours?.openNow ?? true,
        formattedAddress: place.formattedAddress
      }));

      if (window.google?.maps?.geometry?.spherical) {
        const origin = new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng);
        googlePlacesSpots.forEach(spot => {
          const destination = new window.google.maps.LatLng(spot.latitude, spot.longitude);
          const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
          spot.distance = distanceInMeters / 1000;
          spot.formattedDistance = spot.distance < 1
            ? `${Math.round(distanceInMeters)}m`
            : `${spot.distance.toFixed(1)}km`;
        });
      }

      if (googlePlacesSpots.length > 0) {
        updateCache(currentLocation, googlePlacesSpots);
      }

      setParkingSpots(googlePlacesSpots);
    } catch (error) {
      if (error.name === 'AbortError') {
        debug('❌ Búsqueda cancelada - Timeout');
      } else {
        debug('❌ Error en búsqueda de Google Places:', error);
      }
    } finally {
      isSearchingRef.current = false;
    }
  }, [setParkingSpots, getCachedResult, isCacheValid, updateCache]);

  // Función para procesar la cola de búsquedas
  const processSearchQueue = useCallback(async () => {
    if (processingQueueRef.current || searchQueueRef.current.length === 0) return;

    processingQueueRef.current = true;
    const { location, zoom, isMapMoving } = searchQueueRef.current.shift();

    try {
      await performSearch(location, zoom, isMapMoving);
    } catch (error) {
      debug('Error procesando búsqueda:', error);
    } finally {
      processingQueueRef.current = false;

      // Procesar siguiente búsqueda si hay más en la cola
      if (searchQueueRef.current.length > 0) {
        setTimeout(processSearchQueue, MIN_SEARCH_INTERVAL);
      }
    }
  }, [performSearch]);

  const searchNearbyParking = useCallback((location, zoom = 15, isMapMoving = false) => {
    const now = Date.now();
    const timeSinceLastSearch = now - lastSearchTime.current;

    // Si el mapa está en movimiento, usar debounce
    if (isMapMoving) {
      if (mapMovementTimeoutRef.current) {
        clearTimeout(mapMovementTimeoutRef.current);
      }

      mapMovementTimeoutRef.current = setTimeout(() => {
        performSearch(location, zoom, false);
      }, MAP_MOVEMENT_DEBOUNCE);

      return;
    }

    // Si la última búsqueda fue hace muy poco, encolar esta búsqueda
    if (timeSinceLastSearch < MIN_SEARCH_INTERVAL) {
      debug(`⚠️ Búsqueda encolada - Demasiado frecuente (último: ${timeSinceLastSearch}ms < ${MIN_SEARCH_INTERVAL}ms)`);
      searchQueueRef.current.push({ location, zoom, isMapMoving });

      // Iniciar el procesamiento de la cola si no está en proceso
      if (!processingQueueRef.current) {
        setTimeout(processSearchQueue, MIN_SEARCH_INTERVAL - timeSinceLastSearch);
      }
      return;
    }

    lastSearchTime.current = now;
    performSearch(location, zoom, isMapMoving);
  }, [processSearchQueue, performSearch]);

  return {
    searchNearbyParking,
    lastSearchLocationRef
  };
};
