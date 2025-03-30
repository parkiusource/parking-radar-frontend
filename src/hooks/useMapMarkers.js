import { useEffect, useRef, useCallback, useMemo } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

// Añadimos detección de dispositivo móvil
const isMobileDevice = () => window.innerWidth < 768;

/**
 * Verifica si los spots han cambiado comparando sus IDs y propiedades relevantes
 */
const haveSpotsChanged = (currentSpots, previousSpots) => {
  if (!Array.isArray(currentSpots) || !Array.isArray(previousSpots)) return true;

  // Si no hay spots anteriores o la diferencia de longitud es significativa, considerar como cambio
  if (previousSpots.length === 0 || Math.abs(currentSpots.length - previousSpots.length) > 5) return true;

  // En móviles, ser más permisivo con actualizaciones para evitar problemas de visualización
  if (isMobileDevice() && Math.abs(currentSpots.length - previousSpots.length) > 0) return true;

  // Crear un mapa de los spots anteriores por ID para búsqueda eficiente
  const prevSpotsMap = new Map();
  previousSpots.forEach(spot => {
    if (spot.id) {
      prevSpotsMap.set(spot.id, spot);
    }
  });

  // Verificar si hay spots nuevos significativos (no existentes en prev)
  const newSpotsCount = currentSpots.filter(spot => !prevSpotsMap.has(spot.id)).length;

  // En móvil, cualquier cambio es significativo
  if (isMobileDevice()) return newSpotsCount > 0;

  // Para escritorio, considerar cambio significativo si hay más de 3 nuevos spots
  if (newSpotsCount > 3) return true;

  // Para cambios menores, mantener los marcadores existentes y solo actualizar lo necesario
  return false;
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

  // Función para detectar si es dispositivo móvil
  const isMobile = isMobileDevice();

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

  // Función para actualizar marcadores en lotes para mejorar rendimiento
  const batchUpdateMarkers = useCallback((validSpots) => {
    if (pendingMarkerCreation.current || !mapInstance.current) return;

    pendingMarkerCreation.current = true;

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    // Usar setTimeout con 0ms para permitir que el navegador renderice otras cosas primero
    batchTimeout.current = setTimeout(() => {
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

      // En móviles, crear marcadores en lotes más pequeños para evitar bloqueos
      const createMarkersInBatches = (spots, startIndex = 0, batchSize = 5) => {
        if (startIndex >= spots.length) {
          pendingMarkerCreation.current = false;
          return;
        }

        const endIndex = Math.min(startIndex + batchSize, spots.length);
        const batch = spots.slice(startIndex, endIndex);

        batch.forEach(spot => {
          if (!markers.current.has(spot.id)) {
            const newMarker = createMarker(spot);
            if (newMarker) markers.current.set(spot.id, newMarker);
          }
        });

        // Programar el siguiente lote
        setTimeout(() => {
          createMarkersInBatches(spots, endIndex, batchSize);
        }, isMobile ? 30 : 10); // Más tiempo entre lotes en dispositivos móviles
      };

      // Iniciar la creación por lotes
      createMarkersInBatches(validSpots);
    }, 0);
  }, [createMarker, isMobile]);

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

    // Limitar el número de actualizaciones consecutivas para prevenir parpadeo
    markerUpdateCount.current++;
    const shouldThrottleUpdates = markerUpdateCount.current > 3;

    // Verificar si es necesario actualizar los marcadores
    const shouldUpdate = isFirstRender.current ||
                        haveSpotsChanged(validSpots, previousSpots.current) ||
                        markers.current.size === 0;

    if (!shouldUpdate) {
      if (shouldThrottleUpdates) {
        // Resetear el contador después de un tiempo
        setTimeout(() => {
          markerUpdateCount.current = 0;
        }, 5000);
      }
      return;
    }

    // Para dispositivos móviles, usamos la creación en lotes
    if (isMobile) {
      batchUpdateMarkers(validSpots);
    } else {
      // Para desktop, el método original es más rápido
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
    }

    // Actualizar referencias
    previousSpots.current = [...validSpots];
    isFirstRender.current = false;

    if (shouldThrottleUpdates) {
      // Resetear el contador después de una actualización exitosa
      markerUpdateCount.current = 0;
    }

  }, [validSpots, createMarker, updateMarker, batchUpdateMarkers, isMobile]);

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
