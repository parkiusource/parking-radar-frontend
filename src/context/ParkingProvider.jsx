import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ParkingContext } from './parkingContextUtils';
import { useParkingSpots } from '@/api/hooks/useParkingSpots';
import { useQueryClient } from '@/context/queryClientUtils';

// Función para generar un ID único y estable
const generateUniqueId = (placeId, timestamp) => {
  return `google_${placeId}_${timestamp}`;
};

export function ParkingProvider({ children }) {
  const [targetLocation, setTargetLocation] = useState(null);
  const [googlePlacesSpots, setGooglePlacesSpots] = useState([]);

  const queryClient = useQueryClient();
  const { parkingSpots: dbParkingSpots, invalidate, refetch } = useParkingSpots({
    queryClient,
  });

  // Combinar los spots de la base de datos con los de Google Places
  const parkingSpots = useMemo(() => {
    const dbSpots = dbParkingSpots || [];
    const googleSpots = googlePlacesSpots.map(spot => ({
      ...spot,
      id: spot.id || generateUniqueId(spot.placeId || 'unknown', spot.timestamp),
      source: 'google'
    }));

    return [...dbSpots, ...googleSpots];
  }, [dbParkingSpots, googlePlacesSpots]);

  // Función para actualizar los spots de Google Places
  const updateParkingSpots = useCallback((newSpots) => {
    const timestamp = Date.now();
    const spotsWithUniqueIds = newSpots.map(spot => {
      // Si el spot ya tiene un ID, lo mantenemos
      if (spot.id) return { ...spot, source: 'google' };

      return {
        ...spot,
        timestamp,
        id: generateUniqueId(spot.placeId || 'unknown', timestamp),
        source: 'google'
      };
    });
    setGooglePlacesSpots(spotsWithUniqueIds);
  }, []);

  const value = useMemo(() => ({
    parkingSpots,
    setParkingSpots: updateParkingSpots,
    targetLocation,
    setTargetLocation,
    invalidate,
    refetch,
  }), [parkingSpots, updateParkingSpots, targetLocation, invalidate, refetch]);

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
}

ParkingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ParkingProvider;
