import { useEffect, useRef, useCallback, useMemo } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

// Constantes para el procesamiento por lotes
const BATCH_SIZE = 5;
const FRAME_DELAY = 16; // ~60fps

/**
 * Verifica si los spots han cambiado comparando sus IDs
 */
const haveSpotsChanged = (currentSpots, previousSpots) => {
  if (!Array.isArray(currentSpots) || !Array.isArray(previousSpots)) return true;
  if (previousSpots.length === 0) return true;

  const currentIds = new Set(currentSpots.map(s => s.id));
  const previousIds = new Set(previousSpots.map(s => s.id));

  const addedSpots = currentSpots.filter(s => !previousIds.has(s.id)).length;
  const removedSpots = previousSpots.filter(s => !currentIds.has(s.id)).length;

  return (addedSpots + removedSpots) > 0;
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
  const updateQueue = useRef([]);
  const isProcessing = useRef(false);
  const animationFrameId = useRef(null);

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

  // Memoizar la función de actualización de marcadores
  const updateMarker = useCallback((marker, spot) => {
    if (!marker?.element) return false;

    try {
      const content = spot.isGooglePlace
        ? createGooglePlacesMarkerContent()
        : createParkiuMarkerContent(spot);

      marker.element.innerHTML = content.innerHTML;
      return true;
    } catch (error) {
      console.error('Error actualizando marcador:', error);
      return false;
    }
  }, []);

  // Función para procesar un lote de actualizaciones
  const processBatch = useCallback(() => {
    if (updateQueue.current.length === 0) {
      isProcessing.current = false;
      return;
    }

    const batch = updateQueue.current.splice(0, BATCH_SIZE);

    batch.forEach(({ spot, existingMarker }) => {
      if (!spot.id) return;

      if (existingMarker) {
        updateMarker(existingMarker, spot);
      } else {
        const newMarker = createMarker(spot);
        if (newMarker) {
          markers.current.set(spot.id, newMarker);
        }
      }
    });

    // Programar el siguiente lote
    animationFrameId.current = requestAnimationFrame(() => {
      setTimeout(() => {
        processBatch();
      }, FRAME_DELAY);
    });
  }, [createMarker, updateMarker]);

  // Memoizar la función de limpieza de marcadores
  const clearMarkers = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    markers.current.forEach(marker => {
      if (marker?.map) marker.map = null;
    });
    markers.current.clear();
    updateQueue.current = [];
    isProcessing.current = false;
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

    // Evitar actualizaciones innecesarias
    if (!isFirstRender.current && !haveSpotsChanged(validSpots, previousSpots.current)) {
      return;
    }

    const currentIds = new Set(validSpots.map(spot => spot.id));

    // Eliminar marcadores obsoletos inmediatamente
    markers.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.map = null;
        markers.current.delete(id);
      }
    });

    // Preparar cola de actualizaciones
    updateQueue.current = validSpots.map(spot => ({
      spot,
      existingMarker: markers.current.get(spot.id)
    }));

    // Iniciar procesamiento por lotes si no está en curso
    if (!isProcessing.current) {
      isProcessing.current = true;
      processBatch();
    }

    previousSpots.current = validSpots;
    isFirstRender.current = false;
  }, [validSpots, processBatch]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Memoizar el resultado para evitar recreaciones innecesarias
  return useMemo(() => ({
    markers: markers.current,
    clearMarkers
  }), [clearMarkers]);
};

export { useMapMarkers };
