import { useEffect, useRef, useCallback } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

/**
 * Verifica si los spots han cambiado comparando sus IDs y propiedades relevantes
 */
const haveSpotsChanged = (currentSpots, previousSpots) => {
  if (!Array.isArray(currentSpots) || !Array.isArray(previousSpots)) return true;
  if (currentSpots.length !== previousSpots.length) return true;

  return currentSpots.some((spot, index) => {
    const prevSpot = previousSpots[index];
    return spot.id !== prevSpot.id ||
           spot.latitude !== prevSpot.latitude ||
           spot.longitude !== prevSpot.longitude ||
           spot.available_spaces !== prevSpot.available_spaces;
  });
};

/**
 * Hook para manejar los marcadores avanzados del mapa
 * @param {Object} map - Instancia del mapa de Google
 * @param {Array} parkingSpots - Lista de parqueaderos
 * @param {Function} onSpotClick - Callback cuando se selecciona un parqueadero
 * @returns {Object} Funciones y referencias para manejar marcadores
 */
const useMapMarkers = (map, parkingSpots, onSpotClick) => {
  const markers = useRef(new Map());
  const mapInstance = useRef(map);
  const previousSpots = useRef([]);
  const isFirstRender = useRef(true);
  const onSpotClickRef = useRef(onSpotClick);

  // Actualizar la referencia del callback
  useEffect(() => {
    onSpotClickRef.current = onSpotClick;
  }, [onSpotClick]);

  // Función para crear un marcador individual
  const createMarker = useCallback((spot) => {
    if (!spot?.latitude || !spot?.longitude) return null;

    const position = {
      lat: parseFloat(spot.latitude),
      lng: parseFloat(spot.longitude)
    };

    const content = spot.isGooglePlace
      ? createGooglePlacesMarkerContent()
      : createParkiuMarkerContent(spot);

    const marker = createMapMarker({
      position,
      map: mapInstance.current,
      content
    });

    marker.element?.addListener('gmp-click', () => {
      // Usar la referencia más reciente del callback
      onSpotClickRef.current?.(spot);
    });

    return marker;
  }, []);

  // Función para limpiar marcadores
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => {
      if (marker?.map) marker.map = null;
    });
    markers.current.clear();
  }, []);

  // Función para actualizar un marcador existente
  const updateMarker = useCallback((marker, spot) => {
    if (!marker?.element) return false;

    const content = spot.isGooglePlace
      ? createGooglePlacesMarkerContent()
      : createParkiuMarkerContent(spot);

    marker.element.innerHTML = content.innerHTML;
    return true;
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

    const currentIds = new Set(parkingSpots.map(spot => spot.id));
    const markersToRemove = [];

    // Eliminar marcadores que ya no existen
    markers.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.map = null;
        markersToRemove.push(id);
      }
    });

    markersToRemove.forEach(id => markers.current.delete(id));

    // Actualizar o crear marcadores
    parkingSpots.forEach(spot => {
      if (!spot?.id || !spot?.latitude || !spot?.longitude) return;

      const existingMarker = markers.current.get(spot.id);
      if (existingMarker) {
        // Intentar actualizar el marcador existente
        if (!updateMarker(existingMarker, spot)) {
          // Si no se puede actualizar, crear uno nuevo
          existingMarker.map = null;
          const newMarker = createMarker(spot);
          if (newMarker) markers.current.set(spot.id, newMarker);
        }
      } else {
        // Crear nuevo marcador
        const newMarker = createMarker(spot);
        if (newMarker) markers.current.set(spot.id, newMarker);
      }
    });

    // Actualizar referencias
    previousSpots.current = [...parkingSpots];
    isFirstRender.current = false;

  }, [parkingSpots, createMarker, updateMarker]);

  return { markers: markers.current, clearMarkers };
};

export { useMapMarkers };
