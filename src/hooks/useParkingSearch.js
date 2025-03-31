import { useCallback, useRef } from 'react';
import { apiLimiter } from '@/services/apiLimiter';

const MIN_SEARCH_INTERVAL = 3000; // Aumentado a 3 segundos entre búsquedas
const MIN_DISTANCE_FOR_NEW_SEARCH = 100; // Aumentado a 100 metros
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos de expiración del caché

const SEARCH_RADIUS = {
  VERY_CLOSE: 500,  // 500 metros para zoom muy cercano (19+)
  CLOSE: 1000,      // 1 km para zoom cercano (16-18)
  MEDIUM: 2000,     // 2 km para zoom medio (14-15)
  FAR: 3000         // 3 km para zoom lejano (menos de 14)
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

// Función para combinar spots sin duplicados (movida fuera del hook)
const mergeSpots = (existingSpots, newSpots) => {
  if (!Array.isArray(existingSpots) || !existingSpots.length) return newSpots;
  if (!Array.isArray(newSpots) || !newSpots.length) return existingSpots;

  // Crear un mapa de spots existentes por ID para búsqueda rápida
  const spotMap = new Map();
  existingSpots.forEach(spot => {
    if (spot?.id) {
      spotMap.set(spot.id, spot);
    }
    // También mapear por googlePlaceId si está disponible
    if (spot?.googlePlaceId) {
      spotMap.set(spot.googlePlaceId, spot);
    }
  });

  // Agregar nuevos spots solo si no existen ya
  const combinedSpots = [...existingSpots];

  newSpots.forEach(newSpot => {
    // Verificar tanto por ID como por googlePlaceId
    const existsById = newSpot?.id && spotMap.has(newSpot.id);
    const existsByGoogleId = newSpot?.googlePlaceId && spotMap.has(newSpot.googlePlaceId);

    if (!existsById && !existsByGoogleId) {
      combinedSpots.push(newSpot);
    }
  });

  return combinedSpots;
};

export const useParkingSearch = (setParkingSpots, getCachedResult, setCachedResult) => {
  if (!setParkingSpots || !getCachedResult || !setCachedResult) {
    throw new Error('useParkingSearch requiere setParkingSpots, getCachedResult y setCachedResult');
  }

  const lastSearchLocationRef = useRef(null);
  const isSearchingRef = useRef(false);
  const searchQueueRef = useRef([]);
  const processingQueueRef = useRef(false);
  const lastCachedLocationRef = useRef(null);
  const lastCacheTimeRef = useRef(0);
  const lastIdleTimeRef = useRef(0);

  // Función para verificar si el caché es válido
  const isCacheValid = useCallback((location) => {
    if (!lastCachedLocationRef.current || !lastCacheTimeRef.current) {
      debug('❌ Caché no válido - No hay ubicación o timestamp anterior');
      return false;
    }

    const timeSinceLastCache = Date.now() - lastCacheTimeRef.current;
    if (timeSinceLastCache > CACHE_EXPIRY) {
      debug('❌ Caché no válido - Expirado');
      return false;
    }

    const distance = calculateDistance(location, lastCachedLocationRef.current);
    const isWithinDistance = distance < MIN_DISTANCE_FOR_NEW_SEARCH;

    if (!isWithinDistance) {
      debug('❌ Caché no válido - Distancia significativa', { distance, threshold: MIN_DISTANCE_FOR_NEW_SEARCH });
      return false;
    }

    debug('✅ Caché válido - Usando resultados existentes');
    return true;
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

    const currentLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    };

    // Obtener spots actuales antes de cualquier operación
    const currentSpots = getCachedResult(currentLocation) || [];

    // Si ya hay una búsqueda en progreso, mantener los spots actuales
    if (isSearchingRef.current) {
      debug('Búsqueda en progreso, manteniendo spots actuales');
      if (currentSpots.length > 0) {
        setParkingSpots(currentSpots);
      }
      return;
    }

    // Si el mapa está en movimiento y tenemos spots, mantenerlos
    if (isMapMoving && currentSpots.length > 0) {
      debug('Mapa en movimiento, manteniendo spots actuales');
      setParkingSpots(currentSpots);
      return;
    }

    // Verificar si el caché es válido y tenemos spots
    if (isCacheValid(currentLocation) && currentSpots.length > 0) {
      debug('📦 Usando caché válido');
      setParkingSpots(currentSpots);
      updateCache(currentLocation, currentSpots);
      lastSearchLocationRef.current = currentLocation;
      lastIdleTimeRef.current = Date.now();
      return;
    }

    // Si no hay caché válido, realizar la búsqueda
    isSearchingRef.current = true;
    debug('🔍 Realizando nueva búsqueda - No hay caché válido');

    try {
      // Verificar rate limit
      if (!apiLimiter.canMakeCall()) {
        debug('Rate limit alcanzado, manteniendo spots actuales');
        if (currentSpots.length > 0) {
          setParkingSpots(currentSpots);
        }
        return;
      }

      apiLimiter.logCall(currentLocation);

      // Función auxiliar para realizar una búsqueda con un radio específico
      const searchWithRadius = async (radius) => {
        const requestBody = {
          includedTypes: ['parking'],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: currentLocation.lat,
                longitude: currentLocation.lng
              },
              radius: radius
            }
          },
          languageCode: "es"
        };

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
        return await response.json();
      };

      // Determinar el radio inicial basado en el zoom
      let initialRadius;
      if (zoom >= 18) {
        initialRadius = SEARCH_RADIUS.VERY_CLOSE;
      } else if (zoom >= 16) {
        initialRadius = SEARCH_RADIUS.CLOSE;
      } else if (zoom >= 14) {
        initialRadius = SEARCH_RADIUS.MEDIUM;
      } else {
        initialRadius = SEARCH_RADIUS.FAR;
      }

      // Intentar búsqueda con radio inicial
      let data = await searchWithRadius(initialRadius);
      let spots = data.places || [];

      // Si no hay resultados, intentar con radios más grandes
      if (spots.length === 0) {
        debug('No se encontraron resultados con radio inicial, intentando con radios más grandes');

        // Intentar con radio MEDIUM
        if (initialRadius < SEARCH_RADIUS.MEDIUM) {
          data = await searchWithRadius(SEARCH_RADIUS.MEDIUM);
          spots = data.places || [];
        }

        // Si aún no hay resultados, intentar con radio FAR
        if (spots.length === 0 && initialRadius < SEARCH_RADIUS.FAR) {
          data = await searchWithRadius(SEARCH_RADIUS.FAR);
          spots = data.places || [];
        }
      }

      // Si no hay lugares en la respuesta, mantener los spots actuales
      if (!spots.length) {
        debug('❌ No se encontraron lugares en la respuesta, manteniendo spots actuales');
        if (currentSpots.length > 0) {
          setParkingSpots(currentSpots);
          lastSearchLocationRef.current = currentLocation;
          lastIdleTimeRef.current = Date.now();
        }
        return;
      }

      const googlePlacesSpots = spots.map(place => ({
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

      // Calcular distancias si es posible
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

      // Actualizar referencias
      lastSearchLocationRef.current = currentLocation;
      lastIdleTimeRef.current = Date.now();

      // IMPORTANTE: Siempre combinar con los spots actuales
      const combinedSpots = mergeSpots(currentSpots, googlePlacesSpots);
      setParkingSpots(combinedSpots);

      // Actualizar el caché con los nuevos resultados
      updateCache(currentLocation, combinedSpots);
      debug('✅ Búsqueda completada y caché actualizado');

    } catch (error) {
      if (error.name === 'AbortError') {
        debug('❌ Búsqueda cancelada - Timeout');
      } else {
        debug('❌ Error en búsqueda de Google Places:', error);
      }

      // Si hay un error, mantener los spots actuales
      if (currentSpots.length > 0) {
        setParkingSpots(currentSpots);
        lastSearchLocationRef.current = currentLocation;
        lastIdleTimeRef.current = Date.now();
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

  // Función para buscar parqueaderos cercanos
  const searchNearbyParking = useCallback(async (location, zoomLevel = 15, useCache = true, forceSearch = false) => {
    if (!location?.lat || !location?.lng) {
      console.error('❌ Ubicación inválida para búsqueda');
      return [];
    }

    // Verificar cache primero
    if (useCache && !forceSearch) {
      const cachedResults = getCachedResult?.(location);
      if (cachedResults?.length > 0) {
        console.log(`🗺️ [Parking] 📦 Usando ${cachedResults.length} resultados en caché`);
        setParkingSpots(cachedResults);
        return cachedResults;
      }
    }

    try {
      // Realizar búsqueda nueva
      console.log(`🗺️ [Parking] 🔍 Buscando parqueaderos en (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}) con zoom ${zoomLevel}`);

      // Ajustar el radio de búsqueda según el nivel de zoom
      let searchRadius;
      if (zoomLevel >= 18) {
        searchRadius = SEARCH_RADIUS.VERY_CLOSE;
      } else if (zoomLevel >= 16) {
        searchRadius = SEARCH_RADIUS.CLOSE;
      } else if (zoomLevel >= 14) {
        searchRadius = SEARCH_RADIUS.MEDIUM;
      } else {
        searchRadius = SEARCH_RADIUS.FAR;
      }

      // Usar la API de Google Places para búsqueda de parqueaderos reales
      const requestBody = {
        includedTypes: ['parking'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng
            },
            radius: searchRadius
          }
        },
        languageCode: "es"
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours.openNow,places.businessStatus,places.types,places.photos',
          'Accept-Language': 'es'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Si no hay lugares en la respuesta
      if (!data.places || data.places.length === 0) {
        console.warn('🗺️ [Parking] ⚠️ No se encontraron lugares en la respuesta');
        setParkingSpots([]);
        return [];
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
        lastUpdated: Date.now(),
        vicinity: place.formattedAddress,
        types: place.types || ['parking'],
        photos: place.photos || [],
        openNow: place.currentOpeningHours?.openNow ?? true
      }));

      // Calcular distancias si es posible
      if (window.google?.maps?.geometry?.spherical) {
        const origin = new window.google.maps.LatLng(location.lat, location.lng);
        googlePlacesSpots.forEach(spot => {
          const destination = new window.google.maps.LatLng(spot.latitude, spot.longitude);
          const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
          spot.distance = distanceInMeters / 1000;
          spot.formattedDistance = spot.distance < 1
            ? `${Math.round(distanceInMeters)}m`
            : `${spot.distance.toFixed(1)}km`;
        });
      }

      if (googlePlacesSpots && Array.isArray(googlePlacesSpots)) {
        console.log(`🗺️ [Parking] ✅ Encontrados ${googlePlacesSpots.length} parqueaderos`);

        // Guardar en caché si hay resultados
        if (googlePlacesSpots.length > 0 && setCachedResult) {
          setCachedResult(location, googlePlacesSpots);
        }

        // Actualizar estado
        setParkingSpots(googlePlacesSpots);

        // Retornar resultados para uso futuro
        return googlePlacesSpots;
      } else {
        console.warn('🗺️ [Parking] ⚠️ No se encontraron parqueaderos');
        setParkingSpots([]);
        return [];
      }
    } catch (error) {
      console.error('🗺️ [Parking] ❌ Error buscando parqueaderos:', error);
      setParkingSpots([]);
      return [];
    }
  }, [setParkingSpots, getCachedResult, setCachedResult]);

  return { searchNearbyParking };
};
