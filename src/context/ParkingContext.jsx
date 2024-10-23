import PropTypes from 'prop-types';
import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchParkingSpots } from '@/services/ParkingService';
import { connectWebSocket, closeWebSocket } from '@/services/WebSocketService';

export const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [targetLocation, setTargetLocation] = useState(null);
  const webSocketRef = useRef(null);

  const fetchSpots = useCallback(async () => {
    try {
      const data = await fetchParkingSpots();
      setParkingSpots(data);
    } catch (error) {
      console.error('Error fetching the parking spots:', error);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
    if (!webSocketRef.current) {
      const timeoutId = setTimeout(() => {
        webSocketRef.current = connectWebSocket(
          import.meta.env.VITE_API_BASE_URL,
          (data) => {
            if (data.type === 'new-change-in-parking') {
              console.log('New change detected:', data.payload);
              fetchSpots();
            }
          },
        );
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
        if (webSocketRef.current) {
          closeWebSocket();
          webSocketRef.current = null;
        }
      };
    }
  }, [fetchSpots]);
  return (
    <ParkingContext.Provider
      value={{
        parkingSpots,
        setParkingSpots,
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
