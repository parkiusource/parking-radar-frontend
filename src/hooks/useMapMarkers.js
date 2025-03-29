import { useEffect, useRef, useCallback, useMemo } from 'react';
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

  // Memoizar la función de creación de marcadores
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
      onSpotClickRef.current?.(spot);
    });

    return marker;
  }, []);

  // Memoizar la función de limpieza de marcadores
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => {
      if (marker?.map) marker.map = null;
    });
    markers.current.clear();
  }, []);

  // Memoizar la función de actualización de marcadores
  const updateMarker = useCallback((marker, spot) => {
    if (!marker?.element) return false;

    const content = spot.isGooglePlace
      ? createGooglePlacesMarkerContent()
      : createParkiuMarkerContent(spot);

    marker.element.innerHTML = content.innerHTML;
    return true;
  }, []);

  // Memoizar los spots válidos para evitar procesamiento innecesario
  const validSpots = useMemo(() => {
    return parkingSpots.filter(spot =>
      spot?.id &&
      spot?.latitude &&
      spot?.longitude
    );
  }, [parkingSpots]);

  // Efecto para actualizar la referencia del mapa
  useEffect(() => {
    mapInstance.current = map;
  }, [map]);

  // Efecto para actualizar la referencia del callback
  useEffect(() => {
    onSpotClickRef.current = onSpotClick;
  }, [onSpotClick]);

  // Efecto principal para manejar los marcadores
  useEffect(() => {
    if (!mapInstance.current || !Array.isArray(validSpots)) return;

    // Verificar si es necesario actualizar los marcadores
    if (!isFirstRender.current && !haveSpotsChanged(validSpots, previousSpots.current)) {
      return;
    }

    const currentIds = new Set(validSpots.map(spot => spot.id));
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
    validSpots.forEach(spot => {
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
    previousSpots.current = [...validSpots];
    isFirstRender.current = false;

  }, [validSpots, createMarker, updateMarker]);

  // Memoizar el resultado para evitar recreaciones innecesarias
  return useMemo(() => ({
    markers: markers.current,
    clearMarkers
  }), [clearMarkers]);
};

export { useMapMarkers };
