import { useEffect, useRef, useCallback } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

/**
 * Hook para manejar los marcadores avanzados del mapa
 * @param {Object} map - Instancia del mapa de Google
 * @param {Array} parkingSpots - Lista de parqueaderos
 * @param {Function} onSpotClick - Callback cuando se selecciona un parqueadero
 * @returns {Object} Funciones y referencias para manejar marcadores
 */
const useMapMarkers = (map, parkingSpots, onSpotClick) => {
  const markersRef = useRef([]);
  const mapRef = useRef(map);
  const previousSpotsRef = useRef([]);
  const isInitialMount = useRef(true);

  // Memoizar la función de creación de marcadores avanzados
  const createMarker = useCallback((spot, mapInstance) => {
    if (!spot?.latitude || !spot?.longitude) return null;

    const position = {
      lat: parseFloat(spot.latitude),
      lng: parseFloat(spot.longitude)
    };

    console.log(`🎯 Creando marcador avanzado para: ${spot.name || 'Parqueadero sin nombre'} en (${position.lat}, ${position.lng})`);

    // Crear el contenido del marcador según el tipo
    const content = spot.isGooglePlace
      ? createGooglePlacesMarkerContent()
      : createParkiuMarkerContent(spot);

    const marker = createMapMarker({
      position,
      map: mapInstance,
      content
    });

    // Agregar el listener de click usando el elemento del marcador avanzado
    marker.element?.addEventListener('gmp-click', () => {
      if (onSpotClick) {
        onSpotClick(spot);
      }
    });

    return marker;
  }, [onSpotClick]);

  // Función para limpiar marcadores
  const clearMarkers = useCallback(() => {
    console.log('🧹 Limpiando marcadores avanzados existentes');
    markersRef.current.forEach(marker => {
      if (marker?.map) {
        marker.map = null;
      }
    });
    markersRef.current = [];
  }, []);

  // Efecto para actualizar el mapa
  useEffect(() => {
    if (map !== mapRef.current) {
      mapRef.current = map;
    }
  }, [map]);

  // Efecto principal para manejar los marcadores
  useEffect(() => {
    const currentMap = mapRef.current;

    if (!currentMap || !Array.isArray(parkingSpots)) {
      return;
    }

    // Verificar si los spots son realmente diferentes usando sus IDs
    const haveSpotsChanged = () => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return true;
      }

      const currentIds = new Set(parkingSpots.map(s => s.id));
      const previousIds = new Set(previousSpotsRef.current.map(s => s.id));

      if (currentIds.size !== previousIds.size) return true;
      return [...currentIds].some(id => !previousIds.has(id));
    };

    if (!haveSpotsChanged()) {
      console.log('✅ Mismos spots, manteniendo marcadores existentes');
      return;
    }

    console.log('🔄 Actualizando marcadores avanzados...');

    clearMarkers();

    // Crear los marcadores de forma individual
    const newMarkers = parkingSpots
      .filter(spot => spot?.id && spot?.latitude && spot?.longitude)
      .map(spot => createMarker(spot, currentMap))
      .filter(Boolean);

    console.log(`✨ Marcadores avanzados creados: ${newMarkers.length}`);

    markersRef.current = newMarkers;
    previousSpotsRef.current = parkingSpots;

  }, [parkingSpots, createMarker, clearMarkers]);

  return { markersRef, clearMarkers };
};

export { useMapMarkers };
