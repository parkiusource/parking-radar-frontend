import { useEffect, useRef, useCallback, useMemo } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

// Constantes optimizadas para móvil
const MOBILE_BATCH_SIZE = 3;
const MOBILE_BATCH_DELAY = 50;
const DESKTOP_BATCH_SIZE = 10;
const DESKTOP_BATCH_DELAY = 10;

// Añadimos detección de dispositivo móvil
const isMobileDevice = () => window.innerWidth < 768;

/**
 * Verifica si los spots han cambiado comparando sus IDs y propiedades relevantes
 */
const haveSpotsChanged = (currentSpots, previousSpots) => {
  if (!Array.isArray(currentSpots) || !Array.isArray(previousSpots)) return true;
  if (previousSpots.length === 0) return true;

  // En móviles, ser más conservador con las actualizaciones
  if (isMobileDevice()) {
    // Si la diferencia en cantidad es pequeña, mantener los marcadores existentes
    const countDiff = Math.abs(currentSpots.length - previousSpots.length);
    if (countDiff <= 2) return false;

    // Si hay una diferencia significativa, actualizar
    if (countDiff > 5) return true;
  }

  // Crear mapas para comparación eficiente
  const currentIds = new Set(currentSpots.map(s => s.id));
  const previousIds = new Set(previousSpots.map(s => s.id));

  // Calcular diferencias
  const addedSpots = currentSpots.filter(s => !previousIds.has(s.id)).length;
  const removedSpots = previousSpots.filter(s => !currentIds.has(s.id)).length;

  // En móvil, ser más conservador con las actualizaciones
  if (isMobileDevice()) {
    return (addedSpots + removedSpots) > 3;
  }

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
  const markerUpdateCount = useRef(0);
  const pendingMarkerCreation = useRef(false);
  const batchTimeout = useRef(null);

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
      // Solo actualizar el contenido visual, no la posición
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

  // Memoizar la función de limpieza de marcadores
  const clearMarkers = useCallback(() => {
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
      batchTimeout.current = null;
    }

    markers.current.forEach(marker => {
      if (marker?.map) marker.map = null;
    });
    markers.current.clear();
    markerUpdateCount.current = 0;
    pendingMarkerCreation.current = false;
  }, []);

  // Función optimizada para actualizar marcadores en lotes
  const batchUpdateMarkers = useCallback((validSpots) => {
    if (pendingMarkerCreation.current || !mapInstance.current) return;

    pendingMarkerCreation.current = true;

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    const currentIds = new Set(validSpots.map(spot => spot.id));

    // Primero, mantener los marcadores existentes que siguen siendo válidos
    markers.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.map = null;
        markers.current.delete(id);
      }
    });

    // Función para procesar un lote de spots
    const processBatch = (spots, startIndex = 0) => {
      const isMobileNow = isMobileDevice();
      const batchSize = isMobileNow ? MOBILE_BATCH_SIZE : DESKTOP_BATCH_SIZE;
      const delay = isMobileNow ? MOBILE_BATCH_DELAY : DESKTOP_BATCH_DELAY;

      if (startIndex >= spots.length) {
        pendingMarkerCreation.current = false;
        return;
      }

      const endIndex = Math.min(startIndex + batchSize, spots.length);
      const batch = spots.slice(startIndex, endIndex);

      requestAnimationFrame(() => {
        batch.forEach(spot => {
          if (!spot.id) return;

          const existingMarker = markers.current.get(spot.id);
          if (existingMarker) {
            // Actualizar marcador existente si es necesario
            updateMarker(existingMarker, spot);
          } else {
            // Crear nuevo marcador solo si es necesario
            const newMarker = createMarker(spot);
            if (newMarker) {
              markers.current.set(spot.id, newMarker);
            }
          }
        });

        // Programar el siguiente lote
        batchTimeout.current = setTimeout(() => {
          processBatch(spots, endIndex);
        }, delay);
      });
    };

    // Iniciar el procesamiento por lotes
    processBatch(validSpots);
  }, [createMarker, updateMarker]);

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

  // Efecto principal optimizado para manejar los marcadores
  useEffect(() => {
    if (!mapInstance.current || !Array.isArray(validSpots)) return;

    // Evitar actualizaciones innecesarias
    if (!isFirstRender.current && !haveSpotsChanged(validSpots, previousSpots.current)) {
      return;
    }

    // En móvil, usar siempre el método por lotes
    if (isMobileDevice()) {
      batchUpdateMarkers(validSpots);
    } else {
      // Para desktop, actualización directa
      const currentIds = new Set(validSpots.map(spot => spot.id));

      // Eliminar marcadores obsoletos
      markers.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.map = null;
          markers.current.delete(id);
        }
      });

      // Actualizar o crear marcadores necesarios
      validSpots.forEach(spot => {
        if (!spot.id) return;

        const existingMarker = markers.current.get(spot.id);
        if (existingMarker) {
          updateMarker(existingMarker, spot);
        } else {
          const newMarker = createMarker(spot);
          if (newMarker) {
            markers.current.set(spot.id, newMarker);
          }
        }
      });
    }

    previousSpots.current = validSpots;
    isFirstRender.current = false;
  }, [validSpots, createMarker, updateMarker, batchUpdateMarkers]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
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
