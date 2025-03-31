import { useCallback, useRef, useEffect } from 'react';
import { apiLimiter } from '@/services/apiLimiter';

const MIN_SEARCH_INTERVAL = 3000; // Aumentado a 3 segundos entre búsquedas
const MIN_DISTANCE_FOR_NEW_SEARCH = 100; // Aumentado a 100 metros
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache expiry
const MAX_CACHE_SIZE = 50; // Maximum number of locations to cache
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // Clean up cache every 10 minutes

const SEARCH_RADIUS = {
  VERY_CLOSE: 200,  // 200 metros para zoom muy cercano (19+)
  CLOSE: 400,       // 400 metros para zoom cercano (16-18)
  MEDIUM: 800,      // 800 metros para zoom medio (14-15)
  FAR: 1200         // 1.2 km para zoom lejano (menos de 14)
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
      console.warn('🗺️ [Parking] ⚠️ Google Maps Geometry no está disponible');
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
    console.error('🗺️ [Parking] ❌ Error calculando distancia:', error);
    return Infinity;
  }
};

// Función para validar la disponibilidad de la API
const isGoogleMapsAvailable = () => {
  if (!window.google?.maps) {
    console.warn('🗺️ [Parking] ⚠️ Google Maps API no está disponible');
    return false;
  }
  return true;
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

// Función para generar clave de caché consistente
const generateCacheKey = (location) => {
  if (!location || !location.lat || !location.lng) return null;
  // Redondear a 5 decimales para permitir pequeñas variaciones
  const lat = parseFloat(parseFloat(location.lat).toFixed(5));
  const lng = parseFloat(parseFloat(location.lng).toFixed(5));
  // Asegurar que siempre tenga el mismo formato
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
};

// Debug helper para el caché
const debugCache = (action, cacheKey, data = null) => {
  if (import.meta.env.DEV) {
    console.group(`🔍 [Cache ${action}]`);
    console.log('Key:', cacheKey);
    if (data) console.log('Data:', data);
    console.groupEnd();
  }
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
  const cacheCleanupIntervalRef = useRef(null);

  // Cache cleanup function - moved before useEffect
  const cleanupCache = useCallback(() => {
    const allCachedLocations = Object.keys(getCachedResult || {});
    if (allCachedLocations.length > MAX_CACHE_SIZE) {
      // Sort by last accessed time and remove oldest entries
      const sortedLocations = allCachedLocations.sort((a, b) => {
        const entryA = getCachedResult(a);
        const entryB = getCachedResult(b);
        return entryA.lastAccessed - entryB.lastAccessed;
      });

      // Remove oldest entries until we're under the limit
      while (sortedLocations.length > MAX_CACHE_SIZE) {
        const oldestLocation = sortedLocations.shift();
        setCachedResult(oldestLocation, null);
        debug('🧹 Limpiando entrada de caché antigua:', oldestLocation);
      }
    }
  }, [getCachedResult, setCachedResult]);

  // Initialize cache cleanup interval
  useEffect(() => {
    cacheCleanupIntervalRef.current = setInterval(() => {
      cleanupCache();
    }, CACHE_CLEANUP_INTERVAL);

    return () => {
      if (cacheCleanupIntervalRef.current) {
        clearInterval(cacheCleanupIntervalRef.current);
      }
    };
  }, [cleanupCache]);

  // Improved cache validation
  const isCacheValid = useCallback((location) => {
    if (!location || !location.lat || !location.lng) {
      debug('❌ Caché no válido - Ubicación inválida');
      return false;
    }

    const cacheKey = generateCacheKey(location);
    debugCache('Checking', cacheKey);

    // Debug actual cache state
    const allCache = getCachedResult();
    debugCache('Current State', 'all', allCache);

    const cachedEntry = getCachedResult(location);
    debugCache('Retrieved', cacheKey, cachedEntry);

    if (!cachedEntry) {
      debug('❌ Caché no válido - No hay entrada en caché', {
        cacheKey,
        location,
        allCacheKeys: allCache ? Object.keys(allCache) : []
      });
      return false;
    }

    if (!cachedEntry.spots || !Array.isArray(cachedEntry.spots)) {
      debug('❌ Caché no válido - Spots inválidos');
      return false;
    }

    const timeSinceLastCache = Date.now() - cachedEntry.timestamp;
    if (timeSinceLastCache > CACHE_EXPIRY) {
      debug('❌ Caché no válido - Expirado', { timeSinceLastCache, CACHE_EXPIRY });
      return false;
    }

    // Solo validar distancia si tenemos una ubicación en caché
    if (cachedEntry.location) {
      const distance = calculateDistance(location, cachedEntry.location);
      const isWithinDistance = distance < MIN_DISTANCE_FOR_NEW_SEARCH;

      if (!isWithinDistance) {
        debug('❌ Caché no válido - Distancia significativa', {
          distance,
          threshold: MIN_DISTANCE_FOR_NEW_SEARCH,
          currentLocation: location,
          cachedLocation: cachedEntry.location,
          cacheKey
        });
        return false;
      }
    }

    // Update last accessed time
    cachedEntry.lastAccessed = Date.now();
    setCachedResult(location, cachedEntry.spots);

    debug('✅ Caché válido - Usando resultados existentes', {
      cacheKey,
      spotsCount: cachedEntry.spots.length,
      timeSinceLastCache,
      distance: cachedEntry.location ? calculateDistance(location, cachedEntry.location) : 'N/A'
    });
    return true;
  }, [getCachedResult, setCachedResult]);

  // Improved cache update
  const updateCache = useCallback((location, spots) => {
    if (!location || !location.lat || !location.lng) {
      debug('❌ No se puede actualizar caché - Ubicación inválida');
      return;
    }

    if (!Array.isArray(spots)) {
      debug('❌ No se puede actualizar caché - Spots inválidos');
      return;
    }

    const cacheKey = generateCacheKey(location);
    if (!cacheKey) {
      debug('❌ No se puede generar clave de caché');
      return;
    }

    // Actualizar timestamp y lastAccessed
    const now = Date.now();

    debug('💾 Actualizando caché', {
      cacheKey,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      },
      spotsCount: spots.length,
      timestamp: now
    });

    // Debug antes de guardar
    debugCache('Before Update', cacheKey, getCachedResult(location));

    setCachedResult(location, spots);

    // Verificar que se guardó correctamente
    setTimeout(() => {
      const savedEntry = getCachedResult(location);
      debugCache('After Update', cacheKey, savedEntry);
      if (!savedEntry) {
        debug('⚠️ Error: El caché no se guardó correctamente');
      }
    }, 0);

    // Update refs for quick access
    lastCachedLocationRef.current = location;
    lastCacheTimeRef.current = now;
  }, [setCachedResult, getCachedResult]);

  // Función para validar la ubicación
  const validateLocation = useCallback((location) => {
    if (!location || typeof location !== 'object') {
      console.warn('🗺️ [Parking] ⚠️ Ubicación inválida:', location);
      return false;
    }

    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);

    return validateCoordinates(lat, lng);
  }, []);

  // Función para realizar la búsqueda real
  const performSearch = useCallback(async (location, zoom, isMapMoving) => {
    // Validar ubicación
    if (!validateLocation(location)) {
      console.warn('🗺️ [Parking] ⚠️ Ubicación inválida para búsqueda');
      setParkingSpots([]);
      return [];
    }

    // Verificar si Google Maps está disponible
    if (!isGoogleMapsAvailable()) {
      setParkingSpots([]);
      return [];
    }

    const currentLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    };

    // Obtener spots actuales antes de cualquier operación
    const cachedEntry = getCachedResult(currentLocation);
    const currentSpots = cachedEntry?.spots || [];

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
  }, [setParkingSpots, getCachedResult, isCacheValid, updateCache, validateLocation]);

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
    // Validar ubicación
    if (!validateLocation(location)) {
      console.warn('🗺️ [Parking] ⚠️ Ubicación inválida para búsqueda');
      setParkingSpots([]);
      return [];
    }

    // Verificar si Google Maps está disponible
    if (!isGoogleMapsAvailable()) {
      setParkingSpots([]);
      return [];
    }

    // Verificar cache primero
    if (useCache && !forceSearch) {
      const cacheKey = generateCacheKey(location);
      const cachedEntry = getCachedResult(cacheKey);
      if (cachedEntry?.spots?.length > 0 && isCacheValid(location)) {
        console.log(`🗺️ [Parking] 📦 Usando ${cachedEntry.spots.length} resultados en caché`);
        setParkingSpots(cachedEntry.spots);
        return cachedEntry.spots;
      }
    }

    // Si no hay caché válido o se fuerza la búsqueda, realizar nueva búsqueda
    return performSearch(location, zoomLevel, false);
  }, [setParkingSpots, getCachedResult, isCacheValid, performSearch, validateLocation]);

  return { searchNearbyParking };
};
