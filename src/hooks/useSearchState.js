import { useCallback, useRef } from 'react';

const CACHE_KEY = 'parking_location_cache';
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutos (igual que useSearchPlaces)
const MAX_CACHE_ITEMS = 5;
const LOCATION_PRECISION = 4; // 4 decimales ≈ 11 metros de precisión

// Función para redondear coordenadas y reducir variaciones mínimas
const roundCoordinates = (location) => {
  if (!location?.lat || !location?.lng) return null;
  return {
    lat: Number(parseFloat(location.lat).toFixed(LOCATION_PRECISION)),
    lng: Number(parseFloat(location.lng).toFixed(LOCATION_PRECISION))
  };
};

// Función para generar una clave de caché consistente
const generateCacheKey = (location) => {
  const rounded = roundCoordinates(location);
  return rounded ? `${rounded.lat},${rounded.lng}` : null;
};

export function useSearchState() {
  const cacheRef = useRef(null);

  // Inicializar el caché desde localStorage
  const initializeCache = useCallback(() => {
    if (cacheRef.current === null) {
      try {
        const savedCache = localStorage.getItem(CACHE_KEY);
        if (savedCache) {
          const parsedCache = JSON.parse(savedCache);
          if (parsedCache && typeof parsedCache === 'object' && Array.isArray(parsedCache.searches)) {
            // Limpiar entradas expiradas durante la inicialización
            const now = Date.now();
            parsedCache.searches = parsedCache.searches.filter(
              search => now - search.timestamp <= CACHE_EXPIRY
            );
            cacheRef.current = parsedCache;
          } else {
            cacheRef.current = { searches: [] };
          }
        } else {
          cacheRef.current = { searches: [] };
        }
      } catch (error) {
        console.warn('Error al cargar el caché de ubicaciones:', error);
        cacheRef.current = { searches: [] };
      }
    }
    return cacheRef.current;
  }, []);

  // Obtener un resultado del caché
  const getCachedResult = useCallback((location) => {
    if (!location?.lat || !location?.lng) return null;

    const cache = initializeCache();
    const searchKey = generateCacheKey(location);
    if (!searchKey) return null;

    // Limpiar entradas expiradas antes de buscar
    const now = Date.now();
    cache.searches = cache.searches.filter(search => now - search.timestamp <= CACHE_EXPIRY);

    const cachedSearch = cache.searches.find(search => search.key === searchKey);
    if (!cachedSearch || !Array.isArray(cachedSearch.result)) {
      return null;
    }

    // Validar la estructura de los resultados
    const isValidResult = cachedSearch.result.every(spot => (
      spot?.id &&
      spot?.name &&
      spot?.latitude &&
      spot?.longitude
    ));

    return isValidResult ? cachedSearch.result : null;
  }, [initializeCache]);

  // Guardar un resultado en el caché
  const setCachedResult = useCallback((location, result) => {
    if (!location?.lat || !location?.lng || !Array.isArray(result)) {
      return;
    }

    const searchKey = generateCacheKey(location);
    if (!searchKey) return;

    const cache = initializeCache();

    // Mantener solo las búsquedas más recientes
    if (cache.searches.length >= MAX_CACHE_ITEMS) {
      cache.searches.sort((a, b) => b.timestamp - a.timestamp);
      cache.searches = cache.searches.slice(0, MAX_CACHE_ITEMS - 1);
    }

    // Validar y limpiar resultados antes de guardar
    const validResults = result.filter(spot => (
      spot?.id &&
      spot?.name &&
      spot?.latitude &&
      spot?.longitude
    ));

    if (validResults.length === 0) return;

    // Eliminar búsqueda existente si existe
    cache.searches = cache.searches.filter(search => search.key !== searchKey);

    // Agregar nueva búsqueda
    cache.searches.push({
      key: searchKey,
      result: validResults,
      timestamp: Date.now()
    });

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Error al guardar en caché de ubicaciones:', error);
    }
  }, [initializeCache]);

  return {
    getCachedResult,
    setCachedResult
  };
}
