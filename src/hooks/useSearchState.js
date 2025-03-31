import { useRef, useCallback, useEffect } from 'react';

// Función de debug
const debug = (message, data) => {
  if (import.meta.env.DEV) {
    console.log(`🔍 [SearchState] ${message}`, data || '');
  }
};

// Aumentar umbral para móvil
const CACHE_THRESHOLD = window.innerWidth <= 768 ? 50 : 150; // 50m en móvil, 150m en desktop
const CACHE_EXPIRY = 2 * 60 * 1000; // Reducir a 2 minutos en lugar de 10

// Utilidad para calcular distancia entre dos puntos
const getDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return Infinity;

  try {
    // Usar Google Maps para calcular distancia si está disponible
    if (window.google?.maps?.geometry?.spherical) {
      const p1 = new window.google.maps.LatLng(
        parseFloat(loc1.lat),
        parseFloat(loc1.lng)
      );
      const p2 = new window.google.maps.LatLng(
        parseFloat(loc2.lat),
        parseFloat(loc2.lng)
      );
      return window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    }

    // Fallback a Haversine si Google Maps no está disponible
    const toRad = (deg) => deg * Math.PI / 180;
    const R = 6371000;

    const lat1 = parseFloat(loc1.lat);
    const lon1 = parseFloat(loc1.lng);
    const lat2 = parseFloat(loc2.lat);
    const lon2 = parseFloat(loc2.lng);

    if (!isFinite(lat1) || !isFinite(lon1) || !isFinite(lat2) || !isFinite(lon2)) {
      return Infinity;
    }

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  } catch (e) {
    console.error('Error calculando distancia:', e);
    return Infinity;
  }
};

export const useSearchState = () => {
  const cachedResults = useRef({});
  const lastCacheTime = useRef(Date.now());
  const isMobileRef = useRef(window.innerWidth <= 768);

  // Limpiar caché después de 2 minutos en móvil, 5 en desktop
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const expirationTime = isMobileRef.current ? CACHE_EXPIRY : (5 * 60 * 1000);

    Object.keys(cachedResults.current).forEach(key => {
      const entry = cachedResults.current[key];
      if (now - entry.timestamp > expirationTime) {
        delete cachedResults.current[key];
      }
    });
  }, []);

  // Guardar resultados en caché
  const setCachedResult = useCallback((location, results) => {
    if (!location || !Array.isArray(results)) return;

    // Limpiar caché expirada más frecuentemente en móvil
    if (Date.now() - lastCacheTime.current > (isMobileRef.current ? 15000 : 30000)) {
      cleanExpiredCache();
      lastCacheTime.current = Date.now();
    }

    // Crear clave única con más precisión en móvil
    const precision = isMobileRef.current ? 6 : 5;
    const key = `${parseFloat(location.lat).toFixed(precision)},${parseFloat(location.lng).toFixed(precision)}`;

    // Guardar solo la información necesaria
    cachedResults.current[key] = {
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      },
      spots: results,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    };

    debug('💾 Actualizando caché', {
      key,
      spotsCount: results.length,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      }
    });
  }, [cleanExpiredCache]);

  // Obtener resultados de caché con validación mejorada
  const getCachedResult = useCallback((location) => {
    if (!location) return null;

    cleanExpiredCache();

    let bestMatch = null;
    let minDistance = isMobileRef.current ? 50 : CACHE_THRESHOLD;

    Object.entries(cachedResults.current).forEach(([, entry]) => {
      const distance = getDistance(location, entry.location);

      // En móvil, ser más estricto con la distancia y el tiempo
      if (isMobileRef.current) {
        const timeSinceCache = Date.now() - entry.timestamp;
        if (distance < minDistance && timeSinceCache < CACHE_EXPIRY) {
          minDistance = distance;
          bestMatch = entry;
        }
      } else if (distance < minDistance) {
        minDistance = distance;
        bestMatch = entry;
      }
    });

    if (bestMatch) {
      bestMatch.lastAccessed = Date.now();
      console.log(`🔄 Usando caché de ubicación a ${minDistance.toFixed(2)}m de distancia`);
      return bestMatch;
    }

    return null;
  }, [cleanExpiredCache]);

  // Invalidar caché
  const invalidateCache = useCallback(() => {
    cachedResults.current = {};
  }, []);

  // Actualizar isMobileRef cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      isMobileRef.current = window.innerWidth <= 768;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Improved cache validation
  const isCacheValid = useCallback((location) => {
    if (!location || !location.lat || !location.lng) {
      console.error('❌ Caché no válido - Ubicación inválida');
      return false;
    }

    const cacheKey = `${parseFloat(location.lat).toFixed(5)},${parseFloat(location.lng).toFixed(5)}`;
    console.log(`🔍 Checking`, cacheKey);

    // Debug actual cache state
    const allCache = getCachedResult();
    console.log(`🔍 Current State`, 'all', allCache);

    const cachedEntry = getCachedResult(location);
    console.log(`🔍 Retrieved`, cacheKey, cachedEntry);

    if (!cachedEntry) {
      console.error('❌ Caché no válido - No hay entrada en caché', {
        cacheKey,
        location,
        allCacheKeys: allCache ? Object.keys(allCache) : []
      });
      return false;
    }

    if (!cachedEntry.spots || !Array.isArray(cachedEntry.spots)) {
      console.error('❌ Caché no válido - Spots inválidos');
      return false;
    }

    const timeSinceLastCache = Date.now() - cachedEntry.timestamp;
    if (timeSinceLastCache > CACHE_EXPIRY) {
      console.error('❌ Caché no válido - Expirado', { timeSinceLastCache, CACHE_EXPIRY });
      return false;
    }

    // Solo validar distancia si tenemos una ubicación en caché
    if (cachedEntry.location) {
      const distance = getDistance(location, cachedEntry.location);
      const isWithinDistance = distance < CACHE_THRESHOLD;

      if (!isWithinDistance) {
        console.error('❌ Caché no válido - Distancia significativa', {
          distance,
          threshold: CACHE_THRESHOLD,
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

    console.log('✅ Caché válido - Usando resultados existentes', {
      cacheKey,
      spotsCount: cachedEntry.spots.length,
      timeSinceLastCache,
      distance: cachedEntry.location ? getDistance(location, cachedEntry.location) : 'N/A'
    });
    return true;
  }, [getCachedResult, setCachedResult]);

  return {
    setCachedResult,
    getCachedResult,
    invalidateCache,
    isCacheValid
  };
};
