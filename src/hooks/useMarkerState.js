import { useCallback, useRef } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

export const useMarkerState = () => {
  const markersRef = useRef([]);
  const spotMarkerMapRef = useRef(new Map());
  const prevParkingSpotsRef = useRef(null);

  const spotsHaveChanged = useCallback((prevSpots, currentSpots) => {
    if (!prevSpots || !currentSpots) return true;
    if (prevSpots.length !== currentSpots.length) return true;

    // Comparación superficial de los IDs y available_spaces para determinar si actualizar
    for (let i = 0; i < currentSpots.length; i++) {
      const prev = prevSpots[i];
      const curr = currentSpots[i];
      if (!prev || !curr) return true;
      if (prev.id !== curr.id || prev.available_spaces !== curr.available_spaces) {
        return true;
      }
    }
    return false;
  }, []);

  const areLocationsSignificantlyDifferent = useCallback((loc1, loc2) => {
    if (!loc1 || !loc2) return true;
    return Math.abs(loc1.lat - loc2.lat) > MAP_CONSTANTS.COORDINATE_TOLERANCE ||
           Math.abs(loc1.lng - loc2.lng) > MAP_CONSTANTS.COORDINATE_TOLERANCE;
  }, []);

  return {
    markersRef,
    spotMarkerMapRef,
    prevParkingSpotsRef,
    spotsHaveChanged,
    areLocationsSignificantlyDifferent
  };
};
