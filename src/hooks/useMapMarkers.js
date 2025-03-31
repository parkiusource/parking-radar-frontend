import { useEffect, useRef, useCallback } from 'react';
import { createMapMarker, createParkiuMarkerContent, createGooglePlacesMarkerContent } from '@/utils/markerUtils';

/**
 * Hook simplificado para manejar los marcadores del mapa
 * @param {Object} map - Instancia del mapa de Google
 * @param {Array} spots - Lista de parqueaderos
 * @param {Function} onMarkerClick - Callback cuando se selecciona un parqueadero
 * @param {Function} getMarkerOptions - Función para obtener las opciones del marcador
 * @returns {Object} Funciones para manejar marcadores
 */
export const useMapMarkers = (map, spots = [], onMarkerClick, getMarkerOptions) => {
  // Referencias para mantener estado sin causar re-renders
  const markersRef = useRef(new Map());  // Usamos Map en lugar de objeto para mejor rendimiento
  const spotsRef = useRef([]);
  const mapRef = useRef(map);
  const onClickRef = useRef(onMarkerClick);
  const getOptionsRef = useRef(getMarkerOptions);
  const isUpdatingRef = useRef(false);

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

  // Función para crear un marcador
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
          // Actualizar posición y opciones
          existingMarker.element.position = newPosition;
          if (getOptionsRef.current) {
            const options = getOptionsRef.current(spot);
            Object.assign(existingMarker.element, options);
          }
        }

        return existingMarker;
      }

      // Crear nuevo marcador
      const position = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      if (!isFinite(position.lat) || !isFinite(position.lng)) return null;

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

      // Añadir listener de click
      if (onClickRef.current) {
        marker.clickListener = marker.element?.addListener('gmp-click', () => {
          onClickRef.current(spot);
        });
      }

      return marker;
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  }, []);

  // Función para limpiar todos los marcadores
  const clearMarkers = useCallback(() => {
    if (isUpdatingRef.current) return;

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
  }, []);

  // Efecto principal para actualizar marcadores cuando cambian los spots
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(spots)) return;
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    requestAnimationFrame(() => {
      try {
        const validSpots = spots.filter(spot =>
          spot?.id && spot?.latitude && spot?.longitude
        );

        // Conjunto de IDs actuales
        const currentIds = new Set(validSpots.map(spot => spot.id));

        // Eliminar marcadores obsoletos
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
      } finally {
        isUpdatingRef.current = false;
      }
    });

    return () => {
      if (!isUpdatingRef.current) {
        clearMarkers();
      }
    };
  }, [spots, clearMarkers, createMarker]);

  return { clearMarkers };
};
