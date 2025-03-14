import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

import { useParkingSpots } from '@/api/hooks/useParkingSpots';
import { useQueryClient } from '@/context/queryClientUtils';

export const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [targetLocation, setTargetLocation] = useState(null);

  const queryClient = useQueryClient();
  const { parkingSpots, invalidate, refetch } = useParkingSpots({
    queryClient,
  });

  return (
    <ParkingContext.Provider
      value={{
        parkingSpots,
        targetLocation,
        setTargetLocation,
        invalidate,
        refetch,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

ParkingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
