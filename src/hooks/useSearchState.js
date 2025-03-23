import { useRef } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

const searchCache = new Map();

const getCacheKey = (location) => {
  const gridCell = {
    lat: Math.floor(location.lat / MAP_CONSTANTS.SEARCH_GRID_SIZE) * MAP_CONSTANTS.SEARCH_GRID_SIZE,
    lng: Math.floor(location.lng / MAP_CONSTANTS.SEARCH_GRID_SIZE) * MAP_CONSTANTS.SEARCH_GRID_SIZE
  };
  return `${gridCell.lat},${gridCell.lng}`;
};

export const useSearchState = () => {
  const lastSearchLocationRef = useRef(null);

  const getCachedResult = (location) => {
    const cacheKey = getCacheKey(location);
    const cachedResult = searchCache.get(cacheKey);

    if (cachedResult) {
      const { data, timestamp } = cachedResult;
      const age = Date.now() - timestamp;

      if (age < MAP_CONSTANTS.CACHE_DURATION) {
        return data;
      } else {
        searchCache.delete(cacheKey);
      }
    }
    return null;
  };

  const setCachedResult = (location, data) => {
    const cacheKey = getCacheKey(location);
    searchCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  };

  const clearCache = () => {
    searchCache.clear();
  };

  return {
    lastSearchLocationRef,
    getCachedResult,
    setCachedResult,
    clearCache
  };
};
