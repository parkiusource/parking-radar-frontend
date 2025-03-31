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
  const isMobileRef = useRef(false);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth <= 768;
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

      // Crear nuevo marcador con opciones optimizadas para móvil
      const content = spot.isGooglePlace
        ? createGooglePlacesMarkerContent()
        : createParkiuMarkerContent(spot);

      // Ajustar tamaño del marcador según el dispositivo
      const markerSize = isMobileRef.current ? 40 : 32;
      if (content.style) {
        content.style.width = `${markerSize}px`;
        content.style.height = `${markerSize}px`;
        content.style.cursor = 'pointer';
        // Prevenir problemas de content-visibility
        content.style.contain = 'none';
        content.style.contentVisibility = 'visible';
      }

      const markerOptions = {
        position,
        map: mapRef.current,
        content,
        optimized: false, // Desactivar optimización para evitar problemas de visibilidad
        zIndex: isMobileRef.current ? 1000 : 1,
        visible: true,
        clickable: true,
        draggable: false,
        // Opciones específicas para móvil
        ...(isMobileRef.current && {
          collisionBehavior: window.google.maps.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY,
          touchAction: 'manipulation',
        }),
        ...(getOptionsRef.current ? getOptionsRef.current(spot) : {})
      };

      const marker = createMapMarker(markerOptions);

      if (onClickRef.current && marker.element) {
        const handleMarkerClick = () => {
          if (onClickRef.current) {
            onClickRef.current(spot);
          }
        };

        // Usar solo gmp-click para todos los dispositivos
        marker.clickListener = marker.element.addListener('gmp-click', handleMarkerClick);

        // Agregar manejo táctil mejorado para móvil
        if (isMobileRef.current) {
          let touchStartY = 0;
          let touchStartTime = 0;
          const touchThreshold = 10; // pixels
          const timeThreshold = 200; // milliseconds

          marker.element.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
          }, { passive: true });

          marker.element.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchTime = Date.now() - touchStartTime;

            // Solo activar el click si:
            // 1. El movimiento vertical es mínimo (no es scroll)
            // 2. El toque fue rápido (no es un gesto de scroll)
            if (Math.abs(touchEndY - touchStartY) < touchThreshold &&
                touchTime < timeThreshold) {
              handleMarkerClick();
            }
          }, { passive: true });
        }
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

      // Limpiar marcadores de manera segura y síncrona
      const markersToRemove = Array.from(markersRef.current.values());
      markersToRemove.forEach(marker => {
        try {
          // Remover listeners
          if (marker.clickListener) {
            marker.clickListener.remove();
            marker.clickListener = null;
          }

          // Remover el marcador del mapa directamente
          if (marker.element) {
            marker.element.map = null;
          }
        } catch (err) {
          console.warn('Error al limpiar marcador individual:', err);
        }
      });

      // Limpiar todas las referencias
      markersRef.current = new Map();
      spotsRef.current = [];
      lastSpotsHashRef.current = '';
      isUpdatingRef.current = false;
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
      return;
    }

    isUpdatingRef.current = true;

    try {
      // Limpiar marcadores existentes
      clearMarkers();

      // Filtrar spots válidos
      const validSpots = spotsToUpdate.filter(spot =>
        spot?.id && spot?.latitude && spot?.longitude &&
        validateCoordinates(spot.latitude, spot.longitude)
      );

      // En móvil, limitar la cantidad de marcadores visibles
      const maxVisibleMarkers = isMobileRef.current ? 20 : Infinity;
      const spotsToRender = validSpots.slice(0, maxVisibleMarkers);

      // Crear todos los marcadores de una vez
      const newMarkers = new Map();

      // Crear todos los marcadores inmediatamente
      spotsToRender.forEach(spot => {
        try {
          const marker = createMarker(spot);
          if (marker && marker.element) {
            newMarkers.set(spot.id, marker);
            // Asignar el mapa inmediatamente
            marker.element.map = mapRef.current;
          }
        } catch (err) {
          console.warn('Error al crear marcador:', err);
        }
      });

      // Actualizar referencias
      markersRef.current = newMarkers;
      spotsRef.current = spotsToRender;
      lastSpotsHashRef.current = newSpotsHash;
      isUpdatingRef.current = false;

    } catch (error) {
      console.error('Error updating markers:', error);
      isUpdatingRef.current = false;
    }
  }, [clearMarkers, createMarker, validateCoordinates, generateSpotsHash]);

  // Efecto para actualizar marcadores cuando cambian los spots
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(spots)) return;

    // Limpiar marcadores existentes primero
    clearMarkers();

    // Actualizar solo si hay nuevos spots
    if (spots.length > 0) {
      updateMarkers(spots);
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      // Limpiar marcadores al desmontar
      clearMarkers();
    };
  }, [spots, updateMarkers, clearMarkers]);

  return { clearMarkers, updateMarkers };
};
