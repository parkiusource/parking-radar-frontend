import { useState, useCallback } from 'react';

const CACHE_KEY = 'location_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function useLocationCache() {
  const [cache, setCache] = useState(() => {
    try {
      const storedCache = localStorage.getItem(CACHE_KEY);
      return storedCache ? JSON.parse(storedCache) : {};
    } catch (error) {
      console.error('Error loading location cache:', error);
      return {};
    }
  });

  const getLocationCache = useCallback((lat, lng) => {
    const key = `${lat},${lng}`;
    const cachedData = cache[key];

    if (!cachedData) return null;

    // Check if cache has expired
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
      const newCache = { ...cache };
      delete newCache[key];
      setCache(newCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      return null;
    }

    return cachedData.data;
  }, [cache]);

  const setLocationCache = useCallback((lat, lng, data) => {
    const key = `${lat},${lng}`;
    const newCache = {
      ...cache,
      [key]: {
        data,
        timestamp: Date.now()
      }
    };
    setCache(newCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
  }, [cache]);

  return { getLocationCache, setLocationCache };
}
