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
      const markerSize = isMobileRef.current ? 36 : 32;
      if (content.style) {
        content.style.width = `${markerSize}px`;
        content.style.height = `${markerSize}px`;
        content.style.cursor = 'pointer';
        // Forzar visibilidad del marcador
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
        // Asegurar que el marcador siempre esté visible
        content.style.opacity = '1';
        content.style.isolation = 'isolate';
      }

      const markerOptions = {
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
          animation: null, // Remover animación para mejor rendimiento
          flat: true,
          anchor: new window.google.maps.Point(markerSize / 2, markerSize / 2),
        }),
        ...(getOptionsRef.current ? getOptionsRef.current(spot) : {})
      };

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

      if (onClickRef.current && marker.element) {
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
          const touchThreshold = 15; // Aumentado de 10 a 15 pixels
          const timeThreshold = 300; // Aumentado de 200 a 300 ms

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

      // Limpiar marcadores de manera más efectiva
      markersRef.current.forEach(marker => {
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
      });

      // Limpiar todas las referencias
      markersRef.current.clear();
      spotsRef.current = [];
      lastSpotsHashRef.current = '';
      isUpdatingRef.current = false;
    } catch (error) {
      console.error('Error clearing markers:', error);
    }
  }, []);

  const updateMarkers = useCallback((newSpots = null) => {
    if (!mapRef.current || isUpdatingRef.current) return;

    // Forzar limpieza antes de actualizar
    clearMarkers();

    // Si no hay nuevos spots, no continuar
    if (!newSpots || !Array.isArray(newSpots)) {
      return;
    }

    const spotsToUpdate = newSpots;

    // Verificar si los spots han cambiado realmente
    const newSpotsHash = generateSpotsHash(spotsToUpdate);
    if (newSpotsHash === lastSpotsHashRef.current) {
      return;
    }

    isUpdatingRef.current = true;

    try {
      // Filtrar spots válidos
      const validSpots = spotsToUpdate.filter(spot =>
        spot?.id && spot?.latitude && spot?.longitude &&
        validateCoordinates(spot.latitude, spot.longitude)
      );

      // Crear todos los marcadores de una vez
      const newMarkers = new Map();

      // En móvil, crear marcadores en lotes más pequeños
      if (isMobileRef.current) {
        const BATCH_SIZE = 3; // Reducir el tamaño del lote para mejor rendimiento
        const BATCH_DELAY = 50; // Reducir el delay entre lotes

        const processBatch = (startIndex) => {
          const batch = validSpots.slice(startIndex, startIndex + BATCH_SIZE);

          batch.forEach(spot => {
            try {
              const marker = createMarker(spot);
              if (marker && marker.element) {
                newMarkers.set(spot.id, marker);
                // Asegurar que el marcador sea visible
                marker.element.map = mapRef.current;
                requestAnimationFrame(() => {
                  if (marker.element.style) {
                    marker.element.style.visibility = 'visible';
                    marker.element.style.display = 'block';
                    marker.element.style.opacity = '1';
                  }
                });
              }
            } catch (err) {
              console.warn('Error al crear marcador:', err);
            }
          });

          // Procesar el siguiente lote si quedan spots
          if (startIndex + BATCH_SIZE < validSpots.length) {
            setTimeout(() => {
              processBatch(startIndex + BATCH_SIZE);
            }, BATCH_DELAY);
          } else {
            // Finalizar actualización y forzar refresco visual
            markersRef.current = newMarkers;
            spotsRef.current = validSpots;
            lastSpotsHashRef.current = newSpotsHash;
            isUpdatingRef.current = false;

            // Forzar refresco visual de los marcadores
            if (mapRef.current) {
              requestAnimationFrame(() => {
                mapRef.current.panBy(0, 0);
              });
            }
          }
        };

        // Iniciar el procesamiento por lotes
        processBatch(0);
      } else {
        // En desktop, crear todos los marcadores inmediatamente
        validSpots.forEach(spot => {
          try {
            const marker = createMarker(spot);
            if (marker && marker.element) {
              newMarkers.set(spot.id, marker);
              marker.element.map = mapRef.current;
            }
          } catch (err) {
            console.warn('Error al crear marcador:', err);
          }
        });

        // Actualizar referencias inmediatamente en desktop
        markersRef.current = newMarkers;
        spotsRef.current = validSpots;
        lastSpotsHashRef.current = newSpotsHash;
        isUpdatingRef.current = false;
      }
    } catch (error) {
      console.error('Error updating markers:', error);
      isUpdatingRef.current = false;
    }
  }, [clearMarkers, createMarker, validateCoordinates, generateSpotsHash]);

  // Efecto para actualizar marcadores cuando cambian los spots
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(spots)) return;

    // Forzar limpieza inmediata
    clearMarkers();

    // Actualizar solo si hay nuevos spots
    if (spots.length > 0) {
      requestAnimationFrame(() => {
        updateMarkers(spots);
      });
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      clearMarkers();
    };
  }, [spots, updateMarkers, clearMarkers]);

  return { clearMarkers, updateMarkers };
};
