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

  // Helper function to configure marker style
  const configureMarkerStyle = useCallback((content, markerSize) => {
    if (!content.style) return;

    content.style.width = `${markerSize}px`;
    content.style.height = `${markerSize}px`;
    content.style.cursor = 'pointer';
    content.style.position = 'absolute';
    content.style.transform = 'translate(-50%, -50%)';
    content.style.zIndex = isMobileRef.current ? '9999' : '1';
    content.style.contain = 'none';
    content.style.contentVisibility = 'visible';
    content.style.visibility = 'visible';
    content.style.display = 'block';
    content.style.pointerEvents = 'auto';
    content.style.willChange = 'transform';
    content.style.backfaceVisibility = 'visible';
    content.style.opacity = '1';
    content.style.isolation = 'isolate';
  }, []);

  // Helper function to add click listeners to marker
  const attachMarkerListeners = useCallback((marker, spot) => {
    if (!marker?.element || !onClickRef.current) return marker;

    const handleMarkerClick = () => {
      if (onClickRef.current) {
        onClickRef.current(spot);
      }
    };

    // Usar gmp-click para todos los dispositivos
    marker.clickListener = marker.element.addListener('gmp-click', handleMarkerClick);

    // Mejorar el manejo táctil para móvil
    if (isMobileRef.current) {
      let touchStartY = 0;
      let touchStartTime = 0;
      const touchThreshold = 15;
      const timeThreshold = 300;

      marker.element.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }, { passive: true });

      marker.element.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchTime = Date.now() - touchStartTime;

        if (Math.abs(touchEndY - touchStartY) < touchThreshold &&
            touchTime < timeThreshold) {
          handleMarkerClick();
        }
      }, { passive: true });
    }

    return marker;
  }, []);

  // Helper function to get marker options
  const buildMarkerOptions = useCallback((spot, position, content) => {
    const markerSize = isMobileRef.current ? 36 : 32;

    return {
      position,
      map: mapRef.current,
      content,
      optimized: false,
      zIndex: isMobileRef.current ? 9999 : 1,
      visible: true,
      clickable: true,
      draggable: false,
      // Opciones específicas para móvil mejoradas
      ...(isMobileRef.current && {
        collisionBehavior: window.google.maps.CollisionBehavior?.OPTIONAL_AND_HIDES_LOWER_PRIORITY || 'OPTIONAL_AND_HIDES_LOWER_PRIORITY',
        touchAction: 'manipulation',
        animation: null,
        flat: true,
        anchor: new window.google.maps.Point(markerSize / 2, markerSize / 2),
      }),
      ...(getOptionsRef.current ? getOptionsRef.current(spot) : {})
    };
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
      const markerSize = isMobileRef.current ? 36 : 32;
      configureMarkerStyle(content, markerSize);

      const markerOptions = buildMarkerOptions(spot, position, content);
      const marker = createMapMarker(markerOptions);

      // Asegurar que el marcador sea visible después de crearlo
      if (marker.element) {
        requestAnimationFrame(() => {
          if (marker.element.style) {
            marker.element.style.visibility = 'visible';
            marker.element.style.display = 'block';
            marker.element.style.opacity = '1';
          }
        });
      }

      return attachMarkerListeners(marker, spot);
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  }, [validateCoordinates, configureMarkerStyle, buildMarkerOptions, attachMarkerListeners]);

  // Function to clean up a single marker
  const cleanupMarker = useCallback((marker) => {
    try {
      // Remover listeners
      if (marker.clickListener) {
        marker.clickListener.remove();
        marker.clickListener = null;
      }

      // Forzar la eliminación del marcador del mapa
      if (marker.element) {
        marker.element.map = null;
        // Asegurar que el marcador sea realmente removido
        requestAnimationFrame(() => {
          if (marker.element && marker.element.style) {
            marker.element.style.display = 'none';
            marker.element.style.visibility = 'hidden';
          }
        });
      }
    } catch (err) {
      console.warn('Error al limpiar marcador individual:', err);
    }
  }, []);

  const clearMarkers = useCallback(() => {
    try {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      // Limpiar marcadores de manera más efectiva
      markersRef.current.forEach(marker => {
        cleanupMarker(marker);
      });

      // Limpiar todas las referencias
      markersRef.current.clear();
      spotsRef.current = [];
      lastSpotsHashRef.current = '';
      isUpdatingRef.current = false;
    } catch (error) {
      console.error('Error clearing markers:', error);
    }
  }, [cleanupMarker]);

  // Function to update a single marker
  const updateOrCreateMarker = useCallback((spot) => {
    try {
      const existingMarker = markersRef.current.get(spot.id);

      if (existingMarker) {
        // Actualizar marcador existente
        if (existingMarker.element) {
          const position = {
            lat: parseFloat(spot.latitude),
            lng: parseFloat(spot.longitude)
          };
          existingMarker.element.position = position;

          // Actualizar opciones visuales
          if (getOptionsRef.current) {
            const options = getOptionsRef.current(spot);
            Object.assign(existingMarker.element, options);
          }

          // Asegurar que sea visible
          existingMarker.element.map = mapRef.current;
          if (existingMarker.element.style) {
            existingMarker.element.style.visibility = 'visible';
            existingMarker.element.style.display = 'block';
          }
        }
      } else {
        // Crear nuevo marcador solo para spots que no existen
        const marker = createMarker(spot);
        if (marker && marker.element) {
          markersRef.current.set(spot.id, marker);
        }
      }
    } catch (err) {
      console.warn('Error al actualizar marcador:', err);
    }
  }, [createMarker]);

  // Process spots in batches (for mobile)
  const processSpotsBatch = useCallback((validSpots, startIndex, newSpotsHash) => {
    const BATCH_SIZE = 3;
    const BATCH_DELAY = 50;

    const batch = validSpots.slice(startIndex, startIndex + BATCH_SIZE);
    batch.forEach(updateOrCreateMarker);

    // Procesar siguiente lote
    if (startIndex + BATCH_SIZE < validSpots.length) {
      setTimeout(() => {
        processSpotsBatch(validSpots, startIndex + BATCH_SIZE, newSpotsHash);
      }, BATCH_DELAY);
    } else {
      // Finalizar actualización
      spotsRef.current = validSpots;
      lastSpotsHashRef.current = newSpotsHash;
      isUpdatingRef.current = false;
    }
  }, [updateOrCreateMarker]);

  // Remove markers not present in new spots
  const removeStaleMarkers = useCallback((currentSpotIds, newSpotIds) => {
    const spotsToRemove = [...currentSpotIds].filter(id => !newSpotIds.has(id));

    spotsToRemove.forEach(id => {
      const marker = markersRef.current.get(id);
      if (marker) {
        cleanupMarker(marker);
        markersRef.current.delete(id);
      }
    });
  }, [cleanupMarker]);

  // Filter valid spots with proper coordinates
  const filterValidSpots = useCallback((spots) => {
    return spots.filter(spot =>
      spot?.id && spot?.latitude && spot?.longitude &&
      validateCoordinates(spot.latitude, spot.longitude)
    );
  }, [validateCoordinates]);

  const updateMarkers = useCallback((newSpots = null) => {
    if (!mapRef.current || isUpdatingRef.current) return;

    // Si no hay nuevos spots, mantener los actuales
    if (!newSpots || !Array.isArray(newSpots) || newSpots.length === 0) {
      return;
    }

    // Verificar si los spots han cambiado realmente
    const newSpotsHash = generateSpotsHash(newSpots);
    if (newSpotsHash === lastSpotsHashRef.current) {
      // Si los spots no han cambiado, solo actualizar sus propiedades visuales
      if (getOptionsRef.current) {
        markersRef.current.forEach((marker, spotId) => {
          const spot = spotsRef.current.find(s => s.id === spotId);
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
      // Filtrar spots válidos
      const validSpots = filterValidSpots(newSpots);

      // Identificar qué spots agregar, actualizar o eliminar
      const currentSpotIds = new Set(markersRef.current.keys());
      const newSpotIds = new Set(validSpots.map(spot => spot.id));

      // Eliminar marcadores que ya no existen
      removeStaleMarkers(currentSpotIds, newSpotIds);

      // Crear o actualizar marcadores en función del dispositivo
      if (isMobileRef.current) {
        // En móvil, procesar en lotes para mejor rendimiento
        processSpotsBatch(validSpots, 0, newSpotsHash);
      } else {
        // En desktop, procesar todos inmediatamente
        validSpots.forEach(updateOrCreateMarker);

        // Actualizar referencias
        spotsRef.current = validSpots;
        lastSpotsHashRef.current = newSpotsHash;
        isUpdatingRef.current = false;
      }
    } catch (error) {
      console.error('Error updating markers:', error);
      isUpdatingRef.current = false;
    }
  }, [
    generateSpotsHash,
    filterValidSpots,
    removeStaleMarkers,
    processSpotsBatch,
    updateOrCreateMarker
  ]);

  // Efecto para actualizar marcadores cuando cambian los spots
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(spots)) return;

    // Comparar si los spots han cambiado realmente
    const newSpotsHash = generateSpotsHash(spots);
    if (newSpotsHash === lastSpotsHashRef.current) {
      return; // No actualizar si los spots no han cambiado
    }

    // Verificar si hay spots para mostrar
    if (spots.length > 0) {
      requestAnimationFrame(() => {
        updateMarkers(spots);
      });
    } else if (markersRef.current.size > 0) {
      // Solo limpiar si tenemos marcadores y no hay spots
      clearMarkers();
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [spots, updateMarkers, clearMarkers, generateSpotsHash]);

  return { clearMarkers, updateMarkers };
};
