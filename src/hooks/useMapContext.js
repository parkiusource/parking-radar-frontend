import { useContext } from 'react';
import { ParkingContext } from '@/context/parkingContextUtils';
import { UserContext } from '@/context/UserContext';

export const useMapContext = () => {
  const { parkingSpots, targetLocation: contextTargetLocation, setTargetLocation, setParkingSpots } =
    useContext(ParkingContext);

  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user || {};

  return {
    parkingSpots,
    contextTargetLocation,
    setTargetLocation,
    setParkingSpots,
    user,
    updateUser,
    userLocation
  };
};
