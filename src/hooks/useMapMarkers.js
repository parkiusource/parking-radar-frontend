import { useEffect, useRef, useCallback } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

/**
 * Verifica si los spots han cambiado comparando sus IDs
 * @param {Array} currentSpots - Lista actual de parqueaderos
 * @param {Array} previousSpots - Lista anterior de parqueaderos
 * @returns {boolean} True si los spots han cambiado
 */
const haveSpotsChanged = (currentSpots, previousSpots) => {
  const currentIds = new Set(currentSpots.map(s => s.id));
  const previousIds = new Set(previousSpots.map(s => s.id));

  if (currentIds.size !== previousIds.size) return true;
  return [...currentIds].some(id => !previousIds.has(id));
};

/**
 * Hook para manejar los marcadores avanzados del mapa
 * @param {Object} map - Instancia del mapa de Google
 * @param {Array} parkingSpots - Lista de parqueaderos
 * @param {Function} onSpotClick - Callback cuando se selecciona un parqueadero
 * @returns {Object} Funciones y referencias para manejar marcadores
 */
const useMapMarkers = (map, parkingSpots, onSpotClick) => {
  // Referencias para mantener el estado entre renders
  const markers = useRef([]);
  const mapInstance = useRef(map);
  const previousSpots = useRef([]);
  const isFirstRender = useRef(true);

  // Función para crear un marcador individual
  const createMarker = useCallback((spot, map) => {
    if (!spot?.latitude || !spot?.longitude) return null;

    const position = {
      lat: parseFloat(spot.latitude),
      lng: parseFloat(spot.longitude)
    };

    const content = spot.isGooglePlace
      ? createGooglePlacesMarkerContent()
      : createParkiuMarkerContent(spot);

    const marker = createMapMarker({ position, map, content });

    marker.element?.addEventListener('click', () => onSpotClick?.(spot));

    return marker;
  }, [onSpotClick]);

  // Función para limpiar marcadores existentes
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => {
      if (marker?.map) marker.map = null;
    });
    markers.current = [];
  }, []);

  // Efecto para actualizar la referencia del mapa
  useEffect(() => {
    mapInstance.current = map;
  }, [map]);

  // Efecto principal para manejar los marcadores
  useEffect(() => {
    if (!mapInstance.current || !Array.isArray(parkingSpots)) return;

    // Verificar si es necesario actualizar los marcadores
    if (!isFirstRender.current && !haveSpotsChanged(parkingSpots, previousSpots.current)) {
      return;
    }

    // Limpiar marcadores existentes
    clearMarkers();

    // Crear nuevos marcadores
    const validSpots = parkingSpots.filter(spot => spot?.id && spot?.latitude && spot?.longitude);
    markers.current = validSpots
      .map(spot => createMarker(spot, mapInstance.current))
      .filter(Boolean);

    // Actualizar referencias
    previousSpots.current = parkingSpots;
    isFirstRender.current = false;

  }, [parkingSpots, createMarker, clearMarkers]);

  return { markers, clearMarkers };
};

export { useMapMarkers };
