import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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

// Función para comparar dos ubicaciones
const areLocationsEqual = (loc1, loc2) => {
  if (!loc1 || !loc2) return false;
  return (
    Math.abs(parseFloat(loc1.lat) - parseFloat(loc2.lat)) < 0.000001 &&
    Math.abs(parseFloat(loc1.lng) - parseFloat(loc2.lng)) < 0.000001
  );
};

export function ParkingProvider({ children }) {
  const [targetLocation, setTargetLocation] = useState(null);
  const [googlePlacesSpots, setGooglePlacesSpots] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldCenterMap, setShouldCenterMap] = useState(false);
  const lastLocationRef = useRef(null);
  const lastSearchTimestampRef = useRef(0);

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

    // Procesar los nuevos spots
    const processedSpots = newSpots.map(spot => {
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
      total: processedSpots.length,
      originalTotal: newSpots.length
    });

    // Actualizar usando una función para garantizar el estado más reciente
    setGooglePlacesSpots(prevSpots => {
      // Crear un mapa de los spots existentes por ID
      const existingSpotMap = new Map(
        prevSpots.map(spot => [spot.id, spot])
      );

      // Actualizar o agregar nuevos spots
      processedSpots.forEach(spot => {
        existingSpotMap.set(spot.id, {
          ...existingSpotMap.get(spot.id),
          ...spot,
          lastUpdated: timestamp
        });
      });

      // Convertir el mapa de vuelta a array
      const updatedSpots = Array.from(existingSpotMap.values());

      // Ordenar por distancia si está disponible
      return updatedSpots.sort((a, b) => {
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
        return 0;
      });
    });
  }, []);

  // Inicializar searchNearbyParking después de tener updateParkingSpots
  const { searchNearbyParking } = useParkingSearch(updateParkingSpots, getCachedResult, setCachedResult);

  // Función para actualizar la ubicación y centrar el mapa
  const updateTargetLocation = useCallback((newLocation, shouldCenter = false) => {
    // Verificar si la ubicación ha cambiado significativamente
    if (areLocationsEqual(newLocation, lastLocationRef.current)) {
      console.debug('📍 Ubicación no ha cambiado significativamente, omitiendo actualización');
      return;
    }

    console.debug('🎯 Actualizando ubicación objetivo:', {
      location: newLocation,
      shouldCenter
    });

    lastLocationRef.current = newLocation;
    setTargetLocation(newLocation);
    setShouldCenterMap(shouldCenter);
  }, []);

  // Función para obtener la ubicación del usuario
  const getUserLocation = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        console.debug('⚠️ Geolocalización no soportada, usando ubicación por defecto');
        return MAP_CONSTANTS.DEFAULT_CENTER;
      }

      // Verificar si ha pasado suficiente tiempo desde la última búsqueda
      const now = Date.now();
      if (now - lastSearchTimestampRef.current < 2000) {
        console.debug('⏱️ Demasiado pronto para una nueva búsqueda de ubicación');
        return lastLocationRef.current || MAP_CONSTANTS.DEFAULT_CENTER;
      }

      console.debug('🌍 Solicitando ubicación del usuario...');

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 2000 // Permitir usar una ubicación en caché de hasta 2 segundos
        });
      });

      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Verificar si la ubicación ha cambiado significativamente
      if (areLocationsEqual(userLocation, lastLocationRef.current)) {
        console.debug('📍 Ubicación del usuario no ha cambiado significativamente');
        return lastLocationRef.current || MAP_CONSTANTS.DEFAULT_CENTER;
      }

      console.debug('📍 Nueva ubicación obtenida:', userLocation);

      // Ajustar el zoom inicial según el dispositivo
      const isMobile = window.innerWidth < 768;
      const initialZoom = isMobile ? 16 : 17;

      lastSearchTimestampRef.current = now;
      lastLocationRef.current = userLocation;
      updateTargetLocation(userLocation, true);

      // Intentar usar resultados en caché primero
      const cachedResults = getCachedResult(userLocation);
      if (cachedResults?.length > 0) {
        console.debug('💾 Usando resultados en caché para la ubicación');
        updateParkingSpots(cachedResults);
      } else {
        searchNearbyParking(userLocation, initialZoom);
      }

      return userLocation;
    } catch (error) {
      console.debug('⚠️ No se pudo obtener la ubicación:', error);
      // Usar ubicación por defecto en caso de error
      const defaultLocation = MAP_CONSTANTS.DEFAULT_CENTER;
      lastLocationRef.current = defaultLocation;
      updateTargetLocation(defaultLocation, true);
      searchNearbyParking(defaultLocation);
      return defaultLocation;
    }
  }, [updateTargetLocation, searchNearbyParking, getCachedResult, updateParkingSpots]);

  // Combinar los spots de la base de datos con los de Google Places
  const parkingSpots = useMemo(() => {
    const dbSpots = dbParkingSpots || [];
    const googleSpots = googlePlacesSpots;

    // Crear un mapa para evitar duplicados
    const spotMap = new Map();

    // Primero agregar los spots de la base de datos
    dbSpots.forEach(spot => {
      spotMap.set(spot.id, { ...spot, source: 'db' });
    });

    // Luego agregar o actualizar con los spots de Google
    googleSpots.forEach(spot => {
      if (!spotMap.has(spot.id)) {
        spotMap.set(spot.id, { ...spot, source: 'google' });
      }
    });

    // Convertir el mapa a array y ordenar por distancia
    return Array.from(spotMap.values())
      .sort((a, b) => {
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [dbParkingSpots, googlePlacesSpots]);

  // Efecto para la inicialización
  useEffect(() => {
    if (isInitialized) return;

    const initializeParking = async () => {
      // Usar ubicación por defecto del mapa inicialmente
      const defaultLocation = MAP_CONSTANTS.DEFAULT_CENTER;
      console.debug('🗺️ Usando ubicación por defecto:', defaultLocation);

      updateTargetLocation(defaultLocation, true);
      searchNearbyParking(defaultLocation);
      setIsInitialized(true);
    };

    initializeParking();
  }, [isInitialized, searchNearbyParking, updateTargetLocation]);

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
