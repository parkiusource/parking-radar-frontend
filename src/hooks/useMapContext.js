import { useContext } from 'react';
import { ParkingContext } from '@/context/parkingContextUtils';
import { UserContext } from '@/context/userContextDefinition';

/**
 * Hook para acceder al contexto del mapa y usuario
 * @returns {Object} Datos del contexto del mapa y usuario
 * @property {Array} parkingSpots - Lista de parqueaderos
 * @property {Object} contextTargetLocation - Ubicación objetivo del contexto
 * @property {Function} setTargetLocation - Función para establecer la ubicación objetivo
 * @property {Function} setParkingSpots - Función para establecer los parqueaderos
 * @property {Object} user - Datos del usuario actual
 * @property {Function} updateUser - Función para actualizar los datos del usuario
 * @property {Object} userLocation - Ubicación del usuario
 */
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
