import { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ParkingContext } from './parkingContextUtils';
import { useParkingSpots } from '@/api/hooks/useParkingSpots';
import { useQueryClient } from '@/context/queryClientUtils';
import { MAP_CONSTANTS } from '@/constants/map';
import { useParkingSearch } from '@/hooks/useParkingSearch';
import { useSearchState } from '@/hooks/useSearchState';

// Función para generar un ID único y estable
const generateUniqueId = (placeId, timestamp) => {
  return `google_${placeId}_${timestamp}`;
};

export function ParkingProvider({ children }) {
  const [targetLocation, setTargetLocation] = useState(null);
  const [googlePlacesSpots, setGooglePlacesSpots] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldCenterMap, setShouldCenterMap] = useState(false);

  const queryClient = useQueryClient();
  const { parkingSpots: dbParkingSpots, invalidate, refetch } = useParkingSpots({
    queryClient,
  });

  // Obtener las funciones de búsqueda y caché primero
  const { getCachedResult, setCachedResult } = useSearchState();

  // Función para actualizar los spots de Google Places
  const updateParkingSpots = useCallback((newSpots) => {
    // Validar que newSpots sea un array
    if (!Array.isArray(newSpots)) {
      console.debug('⚠️ updateParkingSpots recibió un valor no válido:', newSpots);
      return;
    }

    const timestamp = Date.now();
    const spotsWithUniqueIds = newSpots.map(spot => {
      if (!spot) {
        console.debug('⚠️ Spot inválido encontrado en newSpots');
        return null;
      }

      // Si el spot ya tiene un ID, lo mantenemos
      if (spot.id) return { ...spot, source: 'google' };

      return {
        ...spot,
        timestamp,
        id: generateUniqueId(spot.placeId || 'unknown', timestamp),
        source: 'google'
      };
    }).filter(Boolean); // Eliminar cualquier spot null

    console.debug('📍 Actualizando spots de Google Places:', {
      total: spotsWithUniqueIds.length,
      originalTotal: newSpots.length
    });

    // Actualizar solo si hay spots válidos
    if (spotsWithUniqueIds.length > 0) {
      setGooglePlacesSpots(spotsWithUniqueIds);
    }
  }, []);

  // Inicializar searchNearbyParking después de tener updateParkingSpots
  const { searchNearbyParking } = useParkingSearch(updateParkingSpots, getCachedResult, setCachedResult);

  // Función para actualizar la ubicación y centrar el mapa
  const updateTargetLocation = useCallback((newLocation, shouldCenter = false) => {
    console.debug('🎯 Actualizando ubicación objetivo:', {
      location: newLocation,
      shouldCenter
    });
    setTargetLocation(newLocation);
    setShouldCenterMap(shouldCenter);
  }, []);

  // Función para obtener la ubicación del usuario
  const getUserLocation = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalización no soportada');
      }

      console.debug('🌍 Solicitando ubicación del usuario...');

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.debug('📍 Ubicación obtenida:', userLocation);

      // Ajustar el zoom inicial según el dispositivo
      const isMobile = window.innerWidth < 768;
      const initialZoom = isMobile ? 16 : 17;

      updateTargetLocation(userLocation, true);
      searchNearbyParking(userLocation, initialZoom);
      return userLocation;
    } catch (error) {
      console.debug('⚠️ No se pudo obtener la ubicación:', error);
      return null;
    }
  }, [updateTargetLocation, searchNearbyParking]);

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

  // Efecto para la inicialización
  useEffect(() => {
    if (isInitialized) return;

    const initializeParking = async () => {
      const userLocation = await getUserLocation();

      if (!userLocation) {
        // Usar ubicación por defecto del mapa
        const defaultLocation = MAP_CONSTANTS.DEFAULT_CENTER;
        console.debug('🗺️ Usando ubicación por defecto:', defaultLocation);

        updateTargetLocation(defaultLocation, true);
        searchNearbyParking(defaultLocation);
      }

      setIsInitialized(true);
    };

    initializeParking();
  }, [isInitialized, getUserLocation, searchNearbyParking, updateTargetLocation]);

  const value = useMemo(() => ({
    parkingSpots,
    setParkingSpots: updateParkingSpots,
    targetLocation,
    setTargetLocation: updateTargetLocation,
    shouldCenterMap,
    setShouldCenterMap,
    getUserLocation,
    invalidate,
    refetch,
    isInitialized
  }), [
    parkingSpots,
    updateParkingSpots,
    targetLocation,
    updateTargetLocation,
    shouldCenterMap,
    getUserLocation,
    invalidate,
    refetch,
    isInitialized
  ]);

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
