import { useEffect, useRef, useCallback } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

/**
 * Hook optimizado para manejar los marcadores del mapa
 * @param {Object} map - Instancia del mapa de Google
 * @param {Array} spots - Lista de parqueaderos
 * @param {Function} onMarkerClick - Callback cuando se selecciona un parqueadero
 * @param {Function} getMarkerOptions - Función para obtener las opciones del marcador
 * @returns {Object} Funciones para manejar marcadores
 */
export const useMapMarkers = (map, spots = [], onMarkerClick, getMarkerOptions) => {
  const markersRef = useRef(new Map());
  const spotsRef = useRef([]);
  const mapRef = useRef(map);
  const onClickRef = useRef(onMarkerClick);
  const getOptionsRef = useRef(getMarkerOptions);
  const updateTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const lastSpotsHashRef = useRef('');

  // Función para generar un hash de los spots para comparación rápida
  const generateSpotsHash = useCallback((spots) => {
    if (!Array.isArray(spots)) return '';
    return spots.map(spot => `${spot.id}:${spot.latitude}:${spot.longitude}`).join('|');
  }, []);

  // Actualizar referencias cuando cambian las props
  useEffect(() => {
    mapRef.current = map;
    // Asegurar que todos los marcadores existentes estén en el mapa correcto
    if (map) {
      markersRef.current.forEach(marker => {
        if (marker.element) {
          marker.element.map = map;
        }
      });
    }
  }, [map]);

  useEffect(() => {
    onClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    getOptionsRef.current = getMarkerOptions;
  }, [getMarkerOptions]);

  const validateCoordinates = useCallback((lat, lng) => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    return (
      isFinite(parsedLat) &&
      isFinite(parsedLng) &&
      parsedLat >= -90 &&
      parsedLat <= 90 &&
      parsedLng >= -180 &&
      parsedLng <= 180
    );
  }, []);

  const createMarker = useCallback((spot) => {
    if (!spot?.latitude || !spot?.longitude || !mapRef.current) return null;

    try {
      if (!validateCoordinates(spot.latitude, spot.longitude)) {
        console.warn('Coordenadas inválidas para marcador:', spot);
        return null;
      }

      const position = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      // Reutilizar marcador existente si existe
      const existingMarker = markersRef.current.get(spot.id);
      if (existingMarker?.element) {
        // Actualizar solo las opciones necesarias
        const markerOptions = getOptionsRef.current ? getOptionsRef.current(spot) : {};
        Object.assign(existingMarker.element, {
          position,
          ...markerOptions
        });
        return existingMarker;
      }

      // Crear nuevo marcador con opciones optimizadas
      const content = spot.isGooglePlace
        ? createGooglePlacesMarkerContent()
        : createParkiuMarkerContent(spot);

      const markerOptions = {
        position,
        map: mapRef.current,
        content,
        optimized: true,
        zIndex: 1,
        visible: true,
        ...(getOptionsRef.current ? getOptionsRef.current(spot) : {})
      };

      const marker = createMapMarker(markerOptions);

      if (onClickRef.current && marker.element) {
        marker.clickListener = marker.element.addListener('gmp-click', () => {
          if (onClickRef.current) {
            onClickRef.current(spot);
          }
        });
      }

      return marker;
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  }, [validateCoordinates]);

  const clearMarkers = useCallback(() => {
    try {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      // Limpiar marcadores de manera segura
      markersRef.current.forEach(marker => {
        if (marker.clickListener) {
          marker.clickListener.remove();
        }
        if (marker.element) {
          marker.element.map = null;
        }
      });

      markersRef.current.clear();
      spotsRef.current = [];
      lastSpotsHashRef.current = '';
    } catch (error) {
      console.error('Error clearing markers:', error);
    }
  }, []);

  const updateMarkers = useCallback((newSpots = null) => {
    if (!mapRef.current || isUpdatingRef.current) return;

    const spotsToUpdate = newSpots || spotsRef.current;
    if (!Array.isArray(spotsToUpdate)) return;

    // Verificar si los spots han cambiado realmente
    const newSpotsHash = generateSpotsHash(spotsToUpdate);
    if (newSpotsHash === lastSpotsHashRef.current) {
      // Solo actualizar las opciones de los marcadores existentes
      if (getOptionsRef.current) {
        markersRef.current.forEach((marker, spotId) => {
          const spot = spotsToUpdate.find(s => s.id === spotId);
          if (spot && marker.element) {
            const options = getOptionsRef.current(spot);
            Object.assign(marker.element, options);
          }
        });
      }
      return;
    }

    isUpdatingRef.current = true;

    try {
      // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado
      requestAnimationFrame(() => {
        const validSpots = spotsToUpdate.filter(spot =>
          spot?.id && spot?.latitude && spot?.longitude &&
          validateCoordinates(spot.latitude, spot.longitude)
        );

        // Conjunto de IDs de spots válidos para tracking
        const validSpotIds = new Set(validSpots.map(spot => spot.id));

        // Eliminar marcadores que ya no están en los spots válidos
        markersRef.current.forEach((marker, spotId) => {
          if (!validSpotIds.has(spotId)) {
            if (marker.clickListener) {
              marker.clickListener.remove();
            }
            if (marker.element) {
              marker.element.map = null;
            }
            markersRef.current.delete(spotId);
          }
        });

        // Crear o actualizar marcadores para spots válidos
        validSpots.forEach(spot => {
          const marker = createMarker(spot);
          if (marker) {
            markersRef.current.set(spot.id, marker);
            if (marker.element) {
              marker.element.map = mapRef.current;
              marker.element.visible = true;
            }
          }
        });

        // Actualizar referencias
        spotsRef.current = validSpots;
        lastSpotsHashRef.current = newSpotsHash;
      });
    } catch (error) {
      console.error('Error updating markers:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [createMarker, validateCoordinates, generateSpotsHash]);

  // Efecto para actualizar marcadores cuando cambian los spots
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(spots)) return;

    // Actualización inmediata si hay spots
    if (spots.length > 0) {
      updateMarkers(spots);
    } else {
      // Si no hay spots, limpiar todos los marcadores
      clearMarkers();
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [spots, updateMarkers, clearMarkers]);

  return { clearMarkers, updateMarkers };
};
