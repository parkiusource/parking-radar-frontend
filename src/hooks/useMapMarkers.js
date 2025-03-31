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

      // Crear nuevo marcador
      const content = spot.isGooglePlace
        ? createGooglePlacesMarkerContent()
        : createParkiuMarkerContent(spot);

      const markerOptions = {
        position,
        map: mapRef.current,
        content,
        optimized: false,
        zIndex: 1,
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
    } catch (error) {
      console.error('Error clearing markers:', error);
    }
  }, []);

  const updateMarkers = useCallback((newSpots = null) => {
    if (!mapRef.current) return;

    const spotsToUpdate = newSpots || spotsRef.current;
    if (!Array.isArray(spotsToUpdate)) return;

    // Limpiar todos los marcadores existentes primero
    clearMarkers();

    try {
      const validSpots = spotsToUpdate.filter(spot =>
        spot?.id && spot?.latitude && spot?.longitude &&
        validateCoordinates(spot.latitude, spot.longitude)
      );

      // Crear nuevos marcadores para todos los spots válidos
      validSpots.forEach(spot => {
        const marker = createMarker(spot);
        if (marker) {
          markersRef.current.set(spot.id, marker);
          // Asegurar que el marcador esté visible
          if (marker.element) {
            marker.element.map = mapRef.current;
          }
        }
      });

      // Actualizar la referencia de spots
      spotsRef.current = validSpots;
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [createMarker, validateCoordinates, clearMarkers]);

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
