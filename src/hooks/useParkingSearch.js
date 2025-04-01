import { useCallback, useRef, useEffect } from 'react';
import { apiLimiter } from '@/services/apiLimiter';

// Configuration constants
const CONFIG = {
  MIN_DISTANCE_FOR_NEW_SEARCH: window.innerWidth <= 768 ? 50 : 100,
  CACHE_EXPIRY: 5 * 60 * 1000,
  MAX_CACHE_SIZE: 50,
  CACHE_CLEANUP_INTERVAL: 10 * 60 * 1000,
  SEARCH_INTERVALS: {
    MOBILE: 2000,
    DESKTOP: 3000,
    get current() {
      return window.innerWidth <= 768 ? this.MOBILE : this.DESKTOP;
    }
  },
  SEARCH_RADIUS: {
    VERY_CLOSE: window.innerWidth <= 768 ? 150 : 200,
    CLOSE: window.innerWidth <= 768 ? 300 : 400,
    MEDIUM: window.innerWidth <= 768 ? 600 : 800,
    FAR: window.innerWidth <= 768 ? 1000 : 1200
  },
  FIELDS_MASK: [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.currentOpeningHours.openNow',
    'places.businessStatus',
    'places.types',
    'places.photos'
  ].join(','),
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
};

// Utility functions
const utils = {
  debug: (message, data) => {
    if (import.meta.env.DEV) {
      console.log(`🔍 [ParkingSearch] ${message}`, data || '');
    }
  },

  validateCoordinates: (lat, lng) => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    return !isNaN(parsedLat) &&
           !isNaN(parsedLng) &&
           parsedLat >= -90 &&
           parsedLat <= 90 &&
           parsedLng >= -180 &&
           parsedLng <= 180;
  },

  calculateDistance: (point1, point2) => {
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
  },

  isGoogleMapsAvailable: () => {
    if (!window.google?.maps) {
      console.warn('🗺️ [Parking] ⚠️ Google Maps API no está disponible');
      return false;
    }
    return true;
  },

  mergeSpots: (existingSpots, newSpots) => {
    if (!Array.isArray(existingSpots) || !existingSpots.length) return newSpots;
    if (!Array.isArray(newSpots) || !newSpots.length) return existingSpots;

    const spotMap = new Map();
    existingSpots.forEach(spot => {
      if (spot?.id) spotMap.set(spot.id, spot);
      if (spot?.googlePlaceId) spotMap.set(spot.googlePlaceId, spot);
    });

    const combinedSpots = [...existingSpots];

    newSpots.forEach(newSpot => {
      const existsById = newSpot?.id && spotMap.has(newSpot.id);
      const existsByGoogleId = newSpot?.googlePlaceId && spotMap.has(newSpot.googlePlaceId);

      if (!existsById && !existsByGoogleId) {
        combinedSpots.push(newSpot);
      }
    });

    return combinedSpots;
  },

  generateCacheKey: (location) => {
    if (!location?.lat || !location?.lng) return null;
    const lat = parseFloat(parseFloat(location.lat).toFixed(5));
    const lng = parseFloat(parseFloat(location.lng).toFixed(5));
    return `${lat.toFixed(5)},${lng.toFixed(5)}`;
  },

  debugCache: (action, cacheKey, data = null) => {
    if (import.meta.env.DEV) {
      console.group(`🔍 [Cache ${action}]`);
      console.log('Key:', cacheKey);
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  },

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  determineSearchRadius: (zoom, isMobile) => {
    const effectiveZoom = typeof zoom === 'number' && isFinite(zoom) ? zoom : (isMobile ? 17 : 15);

    if (effectiveZoom >= 18) return CONFIG.SEARCH_RADIUS.VERY_CLOSE;
    if (effectiveZoom >= 16) return CONFIG.SEARCH_RADIUS.CLOSE;
    if (effectiveZoom >= 14) return CONFIG.SEARCH_RADIUS.MEDIUM;
    return CONFIG.SEARCH_RADIUS.FAR;
  },

  mapGooglePlaceToSpot: (place, currentLocation) => {
    const spot = {
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
    };

    // Calculate distance if Google Maps geometry is available
    if (window.google?.maps?.geometry?.spherical && currentLocation) {
      const origin = new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng);
      const destination = new window.google.maps.LatLng(spot.latitude, spot.longitude);
      const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
      spot.distance = distanceInMeters / 1000;
      spot.formattedDistance = spot.distance < 1
        ? `${Math.round(distanceInMeters)}m`
        : `${spot.distance.toFixed(1)}km`;
    }

    return spot;
  }
};

// Cache management hook
const useParkingCache = (getCachedResult, setCachedResult) => {
  const lastCachedLocationRef = useRef(null);
  const lastCacheTimeRef = useRef(0);

  const cleanupCache = useCallback(() => {
    const allCachedLocations = Object.keys(getCachedResult || {});
    if (allCachedLocations.length <= CONFIG.MAX_CACHE_SIZE) return;

    const sortedLocations = allCachedLocations.sort((a, b) => {
      const entryA = getCachedResult(a);
      const entryB = getCachedResult(b);
      return entryA.lastAccessed - entryB.lastAccessed;
    });

    while (sortedLocations.length > CONFIG.MAX_CACHE_SIZE) {
      const oldestLocation = sortedLocations.shift();
      setCachedResult(oldestLocation, null);
      utils.debug('🧹 Limpiando entrada de caché antigua:', oldestLocation);
    }
  }, [getCachedResult, setCachedResult]);

  const isCacheValid = useCallback((location) => {
    if (!location?.lat || !location?.lng) return false;

    const cacheKey = utils.generateCacheKey(location);
    utils.debugCache('Checking', cacheKey);

    const cachedEntry = getCachedResult(location);
    if (!cachedEntry?.spots || !Array.isArray(cachedEntry.spots)) return false;

    const timeSinceLastCache = Date.now() - cachedEntry.timestamp;
    if (timeSinceLastCache > CONFIG.CACHE_EXPIRY) return false;

    if (cachedEntry.location) {
      const distance = utils.calculateDistance(location, cachedEntry.location);
      if (distance >= CONFIG.MIN_DISTANCE_FOR_NEW_SEARCH) return false;
    }

    // Update last accessed time
    cachedEntry.lastAccessed = Date.now();
    setCachedResult(location, cachedEntry.spots);

    return true;
  }, [getCachedResult, setCachedResult]);

  const updateCache = useCallback((location, spots) => {
    if (!location?.lat || !location?.lng || !Array.isArray(spots)) return;

    const cacheKey = utils.generateCacheKey(location);
    if (!cacheKey) return;

    const now = Date.now();

    utils.debug('💾 Actualizando caché', {
      cacheKey,
      location: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
      spotsCount: spots.length,
      timestamp: now
    });

    setCachedResult(location, spots);

    lastCachedLocationRef.current = location;
    lastCacheTimeRef.current = now;
  }, [setCachedResult]);

  // Setup cache cleanup interval
  useEffect(() => {
    const cacheCleanupInterval = setInterval(cleanupCache, CONFIG.CACHE_CLEANUP_INTERVAL);
    return () => clearInterval(cacheCleanupInterval);
  }, [cleanupCache]);

  return { isCacheValid, updateCache };
};

// Google Places Search API hook
const useGooglePlacesSearch = () => {
  const searchWithRadius = useCallback(async (location, radius) => {
    if (!location?.lat || !location?.lng) throw new Error('Invalid location');

    const requestBody = {
      includedTypes: ['parking'],
      maxResultCount: window.innerWidth <= 768 ? 15 : 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng
          },
          radius: radius
        }
      },
      languageCode: "es"
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': CONFIG.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': CONFIG.FIELDS_MASK,
          'Accept-Language': 'es'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  return { searchWithRadius };
};

// Main hook
export const useParkingSearch = (setParkingSpots, getCachedResult, setCachedResult) => {
  if (!setParkingSpots || !getCachedResult || !setCachedResult) {
    throw new Error('useParkingSearch requiere setParkingSpots, getCachedResult y setCachedResult');
  }

  const lastSearchLocationRef = useRef(null);
  const isSearchingRef = useRef(false);
  const searchQueueRef = useRef([]);
  const processingQueueRef = useRef(false);
  const lastIdleTimeRef = useRef(0);
  const debouncedSearchRef = useRef(null);
  const lastSearchTimeRef = useRef(0);

  const { isCacheValid, updateCache } = useParkingCache(getCachedResult, setCachedResult);
  const { searchWithRadius } = useGooglePlacesSearch();

  // Validate location
  const validateLocation = useCallback((location) => {
    if (!location || typeof location !== 'object') return false;

    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);

    return utils.validateCoordinates(lat, lng);
  }, []);

  // Perform search
  const performSearch = useCallback(async (location, zoom, isMapMoving) => {
    // Basic validation
    if (!validateLocation(location) || !utils.isGoogleMapsAvailable()) {
      setParkingSpots([]);
      return [];
    }

    const currentLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    };

    // Get current spots
    const cachedEntry = getCachedResult(currentLocation);
    const currentSpots = cachedEntry?.spots || [];

    // Return current spots if search in progress or map is moving
    if (isSearchingRef.current || (isMapMoving && currentSpots.length > 0)) {
      utils.debug(isSearchingRef.current ? 'Búsqueda en progreso' : 'Mapa en movimiento', 'manteniendo spots actuales');
      setParkingSpots(currentSpots);
      return currentSpots;
    }

    // Use cache if valid
    if (isCacheValid(currentLocation) && currentSpots.length > 0) {
      utils.debug('📦 Usando caché válido');
      setParkingSpots(currentSpots);
      lastSearchLocationRef.current = currentLocation;
      lastIdleTimeRef.current = Date.now();
      return currentSpots;
    }

    // Perform search
    isSearchingRef.current = true;
    utils.debug('🔍 Realizando nueva búsqueda - No hay caché válido');

    try {
      // Check rate limit
      if (!apiLimiter.canMakeCall()) {
        utils.debug('Rate limit alcanzado, manteniendo spots actuales');
        setParkingSpots(currentSpots);
        return currentSpots;
      }

      apiLimiter.logCall(currentLocation);

      // Determine search radius
      const isMobile = window.innerWidth <= 768;
      const initialRadius = utils.determineSearchRadius(zoom, isMobile);

      utils.debug('🔍 Iniciando búsqueda con radio:', {
        zoom,
        initialRadius,
        isMobile
      });

      // Perform search with initial radius
      let data = await searchWithRadius(currentLocation, initialRadius);
      let spots = data.places || [];

      // Try with larger radius if no results on mobile
      if (spots.length === 0 && isMobile) {
        utils.debug('No se encontraron resultados, expandiendo radio de búsqueda');

        let nextRadius;
        if (initialRadius === CONFIG.SEARCH_RADIUS.VERY_CLOSE) {
          nextRadius = CONFIG.SEARCH_RADIUS.CLOSE;
        } else if (initialRadius === CONFIG.SEARCH_RADIUS.CLOSE) {
          nextRadius = CONFIG.SEARCH_RADIUS.MEDIUM;
        } else {
          nextRadius = CONFIG.SEARCH_RADIUS.FAR;
        }

        data = await searchWithRadius(currentLocation, nextRadius);
        spots = data.places || [];
      }

      // Return current spots if no results
      if (!spots.length) {
        utils.debug('❌ No se encontraron lugares en la respuesta');
        setParkingSpots(currentSpots);
        lastSearchLocationRef.current = currentLocation;
        lastIdleTimeRef.current = Date.now();
        return currentSpots;
      }

      // Map Google Places to parking spots
      const googlePlacesSpots = spots.map(place =>
        utils.mapGooglePlaceToSpot(place, currentLocation)
      );

      // Sort by distance on mobile
      if (isMobile && googlePlacesSpots.some(spot => spot.distance)) {
        googlePlacesSpots.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      // Combine with current spots
      const combinedSpots = utils.mergeSpots(currentSpots, googlePlacesSpots);
      setParkingSpots(combinedSpots);

      // Update cache
      updateCache(currentLocation, combinedSpots);
      utils.debug('✅ Búsqueda completada y caché actualizado');

      return combinedSpots;
    } catch (error) {
      if (error.name === 'AbortError') {
        utils.debug('❌ Búsqueda cancelada - Timeout');
      } else {
        utils.debug('❌ Error en búsqueda de Google Places:', error);
      }

      setParkingSpots(currentSpots);
      lastSearchLocationRef.current = currentLocation;
      lastIdleTimeRef.current = Date.now();
      return currentSpots;
    } finally {
      isSearchingRef.current = false;
    }
  }, [
    setParkingSpots,
    getCachedResult,
    isCacheValid,
    updateCache,
    validateLocation,
    searchWithRadius
  ]);

  // Setup debounced search
  useEffect(() => {
    debouncedSearchRef.current = utils.debounce(async (location, zoom, isMapMoving) => {
      const now = Date.now();
      if (now - lastSearchTimeRef.current < CONFIG.SEARCH_INTERVALS.current) {
        utils.debug('⏱️ Ignorando búsqueda - Intervalo mínimo no alcanzado');
        return;
      }
      lastSearchTimeRef.current = now;
      await performSearch(location, zoom, isMapMoving);
    }, 500);

    return () => {
      if (debouncedSearchRef.current?.cancel) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [performSearch]);

  // Process search queue
  const processSearchQueue = useCallback(async () => {
    if (processingQueueRef.current || searchQueueRef.current.length === 0) return;

    processingQueueRef.current = true;
    const { location, zoom, isMapMoving } = searchQueueRef.current.shift();

    try {
      await performSearch(location, zoom, isMapMoving);
    } catch (error) {
      utils.debug('Error procesando búsqueda:', error);
    } finally {
      processingQueueRef.current = false;

      if (searchQueueRef.current.length > 0) {
        setTimeout(processSearchQueue, CONFIG.SEARCH_INTERVALS.current);
      }
    }
  }, [performSearch]);

  // Search nearby parking public API
  const searchNearbyParking = useCallback(async (location, zoomLevel = 15, useCache = true, forceSearch = false) => {
    if (!validateLocation(location) || !utils.isGoogleMapsAvailable()) {
      setParkingSpots([]);
      return [];
    }

    // Check cache if not forcing search
    if (useCache && !forceSearch) {
      const cachedEntry = getCachedResult(location);
      if (cachedEntry?.spots?.length > 0 && isCacheValid(location)) {
        utils.debug('📦 Usando resultados en caché');
        setParkingSpots(cachedEntry.spots);
        return cachedEntry.spots;
      }
    }

    // Use debounced search for non-forced searches
    if (!forceSearch && debouncedSearchRef.current) {
      debouncedSearchRef.current(location, zoomLevel, false);
      return getCachedResult(location)?.spots || [];
    }

    // Perform immediate search for forced searches
    return performSearch(location, zoomLevel, false);
  }, [setParkingSpots, getCachedResult, isCacheValid, performSearch, validateLocation]);

  return { searchNearbyParking };
};
