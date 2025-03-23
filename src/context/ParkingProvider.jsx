import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ParkingContext } from './parkingContextUtils';
import { useParkingSpots } from '@/api/hooks/useParkingSpots';
import { useQueryClient } from '@/context/queryClientUtils';

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
      id: `google_${spot.placeId || spot.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: 'google'
    }));

    return [...dbSpots, ...googleSpots];
  }, [dbParkingSpots, googlePlacesSpots]);

  // Función para actualizar los spots de Google Places
  const updateParkingSpots = (newSpots) => {
    const spotsWithUniqueIds = newSpots.map(spot => ({
      ...spot,
      id: `google_${spot.placeId || spot.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: 'google'
    }));
    setGooglePlacesSpots(spotsWithUniqueIds);
  };

  const value = {
    parkingSpots,
    setParkingSpots: updateParkingSpots,
    targetLocation,
    setTargetLocation,
    invalidate,
    refetch,
  };

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
