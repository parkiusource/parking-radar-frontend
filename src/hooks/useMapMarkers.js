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
  // Referencias para mantener estado sin causar re-renders
  const markersRef = useRef(new Map());
  const spotsRef = useRef([]);
  const mapRef = useRef(map);
  const onClickRef = useRef(onMarkerClick);
  const getOptionsRef = useRef(getMarkerOptions);
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef(null);
  const rafIdRef = useRef(null);
  const cleanupInProgressRef = useRef(false);

  // Actualizar referencias cuando cambian las props
  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    onClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    getOptionsRef.current = getMarkerOptions;
  }, [getMarkerOptions]);

  useEffect(() => {
    spotsRef.current = spots;
  }, [spots]);

  // Función optimizada para crear un marcador
  const createMarker = useCallback((spot) => {
    if (!spot?.latitude || !spot?.longitude || !mapRef.current) return null;

    try {
      // Si ya existe un marcador para este spot, actualizarlo
      const existingMarker = markersRef.current.get(spot.id);
      if (existingMarker) {
        const newPosition = {
          lat: parseFloat(spot.latitude),
          lng: parseFloat(spot.longitude)
        };

        if (existingMarker.element) {
          existingMarker.element.position = newPosition;
          if (getOptionsRef.current) {
            const options = getOptionsRef.current(spot);
            Object.assign(existingMarker.element, options);
          }
        }

        return existingMarker;
      }

      // Validar coordenadas antes de crear el marcador
      const position = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      if (!isFinite(position.lat) || !isFinite(position.lng) ||
          position.lat < -90 || position.lat > 90 ||
          position.lng < -180 || position.lng > 180) {
        console.warn('Coordenadas inválidas para marcador:', position);
        return null;
      }

      const content = spot.isGooglePlace
        ? createGooglePlacesMarkerContent()
        : createParkiuMarkerContent(spot);

      const markerOptions = getOptionsRef.current ? getOptionsRef.current(spot) : {};
      const marker = createMapMarker({
        position,
        map: mapRef.current,
        content,
        ...markerOptions
      });

      // Añadir listener de click optimizado
      if (onClickRef.current && marker.element) {
        marker.clickListener = marker.element.addListener('gmp-click', () => {
          requestAnimationFrame(() => {
            if (onClickRef.current) {
              onClickRef.current(spot);
            }
          });
        });
      }

      return marker;
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  }, []);

  // Función optimizada para limpiar marcadores
  const clearMarkers = useCallback(() => {
    if (cleanupInProgressRef.current) return;
    cleanupInProgressRef.current = true;

    try {
      // Cancelar cualquier actualización pendiente
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Limpiar marcadores de manera eficiente
      markersRef.current.forEach(marker => {
        try {
          if (marker.clickListener) {
            marker.clickListener.remove();
          }
          if (marker.element) {
            marker.element.map = null;
          }
        } catch (error) {
          console.error('Error clearing marker:', error);
        }
      });

      markersRef.current.clear();
    } finally {
      cleanupInProgressRef.current = false;
    }
  }, []);

  // Función optimizada para actualizar marcadores
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !Array.isArray(spotsRef.current) || isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const validSpots = spotsRef.current.filter(spot =>
        spot?.id && spot?.latitude && spot?.longitude &&
        isFinite(parseFloat(spot.latitude)) &&
        isFinite(parseFloat(spot.longitude))
      );

      // Crear conjunto de IDs actuales para comparación eficiente
      const currentIds = new Set(validSpots.map(spot => spot.id));

      // Eliminar marcadores obsoletos de manera eficiente
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          if (marker.clickListener) {
            marker.clickListener.remove();
          }
          if (marker.element) {
            marker.element.map = null;
          }
          markersRef.current.delete(id);
        }
      });

      // Crear o actualizar marcadores
      validSpots.forEach(spot => {
        const marker = createMarker(spot);
        if (marker) {
          markersRef.current.set(spot.id, marker);
        }
      });

      // Forzar una actualización visual suave
      rafIdRef.current = requestAnimationFrame(() => {
        if (mapRef.current) {
          mapRef.current.panBy(1, 0);
          setTimeout(() => {
            mapRef.current.panBy(-1, 0);
          }, 50);
        }
      });
    } catch (error) {
      console.error('Error updating markers:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [createMarker]);

  // Efecto principal optimizado para actualizar marcadores
  useEffect(() => {
    if (isUpdatingRef.current) return;

    // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado
    rafIdRef.current = requestAnimationFrame(() => {
      updateMarkers();
    });

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [spots, updateMarkers]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, [clearMarkers]);

  return { clearMarkers };
};
