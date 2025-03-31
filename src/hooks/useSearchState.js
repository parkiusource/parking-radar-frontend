import { useRef, useCallback } from 'react';

// Distancia máxima para considerar una ubicación como en caché (en metros)
const CACHE_THRESHOLD = 150;

// Utilidad para calcular distancia entre dos puntos
const getDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return Infinity;

  try {
    // Usar fórmula de Haversine para mayor precisión
    const toRad = (deg) => deg * Math.PI / 180;
    const R = 6371000; // Radio de la tierra en metros

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
  // Usamos un objeto para almacenar resultados con marcas de tiempo
  const cachedResults = useRef({});
  const lastCacheTime = useRef(Date.now());

  // Limpiar caché después de 10 minutos
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const expirationTime = 10 * 60 * 1000; // 10 minutos en milisegundos

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

    // Limpiar caché expirada periódicamente
    if (Date.now() - lastCacheTime.current > 30000) { // Cada 30 segundos
      cleanExpiredCache();
      lastCacheTime.current = Date.now();
    }

    // Crear clave única basada en coordenadas redondeadas para mejorar la coincidencia
    const key = `${parseFloat(location.lat).toFixed(5)}_${parseFloat(location.lng).toFixed(5)}`;

    cachedResults.current[key] = {
      location,
      results: [...results], // Crear copia para evitar mutaciones
      timestamp: Date.now()
    };
  }, [cleanExpiredCache]);

  // Obtener resultados de caché si existe una ubicación cercana
  const getCachedResult = useCallback((location) => {
    if (!location) return null;

    // Verificar caché expirada
    cleanExpiredCache();

    // Buscar la entrada más cercana
    let bestMatch = null;
    let minDistance = CACHE_THRESHOLD;

    Object.values(cachedResults.current).forEach(entry => {
      const distance = getDistance(location, entry.location);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = entry;
      }
    });

    // Si encontramos una coincidencia suficientemente cercana, usarla
    if (bestMatch) {
      console.log(`🔄 Usando caché de ubicación a ${minDistance.toFixed(2)}m de distancia`);
      return bestMatch.results;
    }

    return null;
  }, [cleanExpiredCache]);

  // Invalidar todos los datos en caché
  const invalidateCache = useCallback(() => {
    cachedResults.current = {};
  }, []);

  return {
    setCachedResult,
    getCachedResult,
    invalidateCache
  };
};
