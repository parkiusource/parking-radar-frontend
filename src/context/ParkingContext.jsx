import { createContext, useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';

import { useParkingSpots } from '@/api/hooks/useParkingSpots';
import { closeWebSocket, connectWebSocket } from '@/services/WebSocketService';
import { useQueryClient } from '@/context/queryClientUtils';

export const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const webSocketRef = useRef(null);
  const [targetLocation, setTargetLocation] = useState(null);

  const queryClient = useQueryClient();
  const { parkingSpots, invalidate, refetch } = useParkingSpots({
    queryClient,
  });

  useEffect(() => {
    if (!webSocketRef.current) {
      const timeoutId = setTimeout(() => {
        webSocketRef.current = connectWebSocket(
          import.meta.env.VITE_API_BASE_URL,
          (data) => {
            if (data.type === 'new-change-in-parking') {
              invalidate();
              refetch();
            }
          },
        );
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        if (webSocketRef.current) {
          closeWebSocket();
          webSocketRef.current = null;
        }
      };
    }
  }, [invalidate, refetch]);

  return (
    <ParkingContext.Provider
      value={{
        parkingSpots,
        targetLocation,
        setTargetLocation,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

ParkingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
