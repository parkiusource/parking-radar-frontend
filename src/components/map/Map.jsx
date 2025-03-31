import { GoogleMap, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import { BiTargetLock } from 'react-icons/bi';
import { FaSearch } from 'react-icons/fa';
import { useSearchState } from '@/hooks/useSearchState';
import { ParkingContext } from '@/context/parkingContextUtils';
import { UserContext } from '@/context/userContextDefinition';
import { MAP_CONSTANTS } from '@/constants/map';
import { useMap } from '@/hooks/useMap';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import { useParkingSearch } from '@/hooks/useParkingSearch';
import { useGeolocation } from '@/services/geolocationService';
import ParkingInfoWindow from './ParkingInfoWindow';
import { LocationRequestModal } from './LocationRequestModal';
import ParkingCarousel from './ParkingCarousel';

// Función de debug que solo muestra logs en desarrollo
const debug = (message, data) => {
  if (import.meta.env.DEV) {
    console.log(`🗺️ [Map] ${message}`, data || '');
  }
};

const ParkingMap = forwardRef(({ onLocationChange }, ref) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: MAP_CONSTANTS.LIBRARIES
  });

  const { user, updateUser } = useContext(UserContext);
  const { location: userLoc } = user || {};
  const { getCachedResult, setCachedResult } = useSearchState();
  const {
    parkingSpots: contextParkingSpots,
    targetLocation: contextTargetLocation,
    shouldCenterMap,
    setShouldCenterMap,
    setParkingSpots,
    setTargetLocation
  } = useContext(ParkingContext);

  // Hook de geolocalización
  const { error: geoError, loading: geoLoading, getCurrentLocation } = useGeolocation();

  // Estados y referencias
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [showSearchHereButton, setShowSearchHereButton] = useState(false);

  const hasInitialized = useRef(false);
  const mapMoveTimeoutRef = useRef(null);
  const lastSearchLocationRef = useRef(null);
  const userMarkerRef = useRef(null);
  const lastIdleTimeRef = useRef(null);
  const isSearchingRef = useRef(false);
  const lastZoomLevel = useRef(null);
  const searchHereLocationRef = useRef(null);
  const isMarkerInteractionRef = useRef(false);
  const markerInteractionTimeoutRef = useRef(null);

  // Constantes
  const MIN_IDLE_INTERVAL = 1500;

  // Inicializar hooks personalizados
  const { searchNearbyParking } = useParkingSearch(setParkingSpots, getCachedResult, setCachedResult);
  const {
    handleMapLoad: originalHandleMapLoad,
    mapCenter,
    effectiveTargetLocation,
    forceMapUpdate,
    setForceMapUpdate
  } = useMap(userLoc, contextTargetLocation, MAP_CONSTANTS.DEFAULT_LOCATION);

  // Estado para manejar la selección de manera independiente
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  // Optimizar markSpotAsSelected para no actualizar todos los spots
  const markSpotAsSelected = useCallback((spot) => {
    if (!spot) return;

    // Solo actualizamos el ID seleccionado
    const spotId = spot.id || spot.googlePlaceId;
    setSelectedSpotId(spotId);

    // Actualizamos el selectedSpot para el InfoWindow sin modificar el array completo
    setSelectedSpot(spot);
  }, []);

  // Hook personalizado para manejar la visualización de los marcadores
  const getMarkerOptions = useCallback((spot) => {
    const isSelected = spot.id === selectedSpotId || spot.googlePlaceId === selectedSpotId;
    return {
      opacity: isSelected ? 1 : 0.8,
      zIndex: isSelected ? 2 : 1,
      optimized: false // Desactivar optimización para evitar parpadeos
    };
  }, [selectedSpotId]);

  // Función para ajustar el mapa cuando se abre un InfoWindow
  const adjustMapForInfoWindow = useCallback((position) => {
    if (!mapInstance) return;

    // Calcular el offset para el InfoWindow (aproximadamente 100px hacia arriba)
    const offset = new window.google.maps.Point(0, -100);

    // Convertir el offset a coordenadas del mapa
    const projection = mapInstance.getProjection();
    if (!projection) return;

    const scale = 1 << mapInstance.getZoom();
    const worldPoint = projection.fromLatLngToPoint(position);
    const newWorldPoint = new window.google.maps.Point(
      worldPoint.x,
      worldPoint.y + (offset.y / scale)
    );
    const newLatLng = projection.fromPointToLatLng(newWorldPoint);

    // Animar el mapa suavemente a la nueva posición
    mapInstance.panTo(newLatLng);
  }, [mapInstance]);

  // Modificar el manejo de marcadores para incluir el ajuste del mapa
  const { clearMarkers, updateMarkers } = useMapMarkers(
    mapInstance,
    contextParkingSpots,
    useCallback((spot) => {
      if (!spot || !mapInstance) return;

      // Prevenir múltiples interacciones rápidas
      if (isMarkerInteractionRef.current) return;
      isMarkerInteractionRef.current = true;

      const position = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      // Actualizar el marcador seleccionado y mostrar InfoWindow
      markSpotAsSelected(spot);
      setSelectedSpot(spot);

      // Ajustar el mapa para el InfoWindow sin limpiar marcadores
      adjustMapForInfoWindow(new window.google.maps.LatLng(position));

      if (onLocationChange) {
        onLocationChange(spot);
      }

      // Permitir nuevas interacciones después de la animación
      if (markerInteractionTimeoutRef.current) {
        clearTimeout(markerInteractionTimeoutRef.current);
      }
      markerInteractionTimeoutRef.current = setTimeout(() => {
        isMarkerInteractionRef.current = false;
      }, 300);

      // Ocultar el botón de búsqueda sin limpiar marcadores
      setShowSearchHereButton(false);
    }, [mapInstance, onLocationChange, markSpotAsSelected, adjustMapForInfoWindow]),
    getMarkerOptions
  );

  // Abrir navegación
  const openNavigation = useCallback((lat, lng) => {
    if (!lat || !lng) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }, []);

  // Manejar cierre de InfoWindow de manera optimizada
  const handleInfoWindowClose = useCallback(() => {
    setSelectedSpotId(null);
    setSelectedSpot(null);

    // Mostrar el botón de búsqueda después de un pequeño delay
    if (searchHereLocationRef.current) {
      setTimeout(() => {
        setShowSearchHereButton(true);
      }, 300);
    }
  }, []);

  // Modificar el renderInfoWindow para ajustar el mapa cuando se abre
  const renderInfoWindow = useMemo(() => {
    if (!selectedSpot) return null;

    const position = {
      lat: parseFloat(selectedSpot.latitude),
      lng: parseFloat(selectedSpot.longitude)
    };

    return (
      <InfoWindowF
        position={position}
        onCloseClick={handleInfoWindowClose}
        onLoad={() => {
          // Ajustar el mapa cuando el InfoWindow se carga
          adjustMapForInfoWindow(new window.google.maps.LatLng(position));
        }}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          maxWidth: 280,
          disableAutoPan: true,
          zIndex: 10
        }}
      >
        <ParkingInfoWindow
          spot={selectedSpot}
          onNavigate={() => openNavigation(selectedSpot.latitude, selectedSpot.longitude)}
        />
      </InfoWindowF>
    );
  }, [selectedSpot, handleInfoWindowClose, openNavigation, adjustMapForInfoWindow]);

  // Manejar skip de ubicación
  const handleLocationSkip = useCallback(() => {
    setShowLocationModal(false);
    const defaultLocation = MAP_CONSTANTS.DEFAULT_LOCATION;

    // Actualizar la ubicación del usuario
    updateUser({ location: defaultLocation });

    // Actualizar target location primero para que se actualice el contexto
    setTargetLocation(defaultLocation);

    // Centrar el mapa en la nueva ubicación
    if (mapInstance) {
      mapInstance.setZoom(16);
      mapInstance.panTo(defaultLocation);
    }

    // Limpiar estado visual
    setSelectedSpot(null);
    setParkingSpots([]);

    // Esperar breve momento para que se actualice la UI
    setTimeout(() => {
      // Realizar búsqueda forzada ignorando caché
      debug('🔍 Realizando búsqueda en ubicación por defecto');
      searchNearbyParking(defaultLocation, 16, false, true)
        .then(results => {
          if (results && results.length > 0) {
            // Actualizar el estado con los nuevos resultados
            setParkingSpots(results);
            lastSearchLocationRef.current = defaultLocation;
            lastIdleTimeRef.current = Date.now();

            // Forzar actualización del mapa para refrescar los marcadores
            if (mapInstance) {
              setTimeout(() => {
                mapInstance.panBy(1, 0);
                setTimeout(() => mapInstance.panBy(-1, 0), 50);
              }, 200);
            }
          } else {
            debug('⚠️ No se encontraron resultados para ubicación por defecto');
          }
        })
        .catch(() => {
          debug('⚠️ No se encontraron resultados para ubicación por defecto');
        });
    }, 100);
  }, [updateUser, mapInstance, searchNearbyParking, setParkingSpots, setTargetLocation]);

  // Solicitar ubicación del usuario
  const requestUserLocation = useCallback(async () => {
    try {
      debug('🔍 Iniciando solicitud de ubicación del usuario');
      setShowSearchHereButton(false);

      // Primero obtener la ubicación sin limpiar nada aún
      const userLocation = await getCurrentLocation();

      // Validar la ubicación obtenida
      if (!userLocation ||
          !isFinite(userLocation.lat) ||
          !isFinite(userLocation.lng) ||
          userLocation.lat < -90 || userLocation.lat > 90 ||
          userLocation.lng < -180 || userLocation.lng > 180) {
        throw new Error('Ubicación inválida');
      }

      debug('📍 Ubicación obtenida:', userLocation);

      // Actualizar la ubicación del usuario
      updateUser({ location: userLocation });

      // Actualizar target location primero para que se actualice el contexto
      setTargetLocation(userLocation);

      // Centrar el mapa en la nueva ubicación con zoom específico
      if (mapInstance) {
        // Detectar si estamos en móvil
        const isMobile = window.innerWidth <= 768;
        const zoomLevel = isMobile ? 17 : 15; // Aumentar zoom en móvil

        // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado
        requestAnimationFrame(() => {
          // Primero establecer el zoom y luego centrar
          mapInstance.setZoom(zoomLevel);
          mapInstance.panTo(userLocation);

          // Solo limpiar spots si no hay un spot seleccionado
          if (!selectedSpot) {
            setParkingSpots([]);
          }

          // Realizar búsqueda forzada ignorando caché
          debug('🔍 Realizando búsqueda forzada en ubicación actual');
          searchNearbyParking(userLocation, zoomLevel, false, true)
            .then(results => {
              if (results && results.length > 0) {
                setParkingSpots(results);
                lastSearchLocationRef.current = userLocation;
                lastIdleTimeRef.current = Date.now();

                // Forzar actualización visual de los marcadores
                setTimeout(() => {
                  if (mapInstance) {
                    mapInstance.panBy(0, 1);
                    setTimeout(() => {
                      mapInstance.panBy(0, -1);
                    }, 50);
                  }
                }, 100);
              }
              setShowLocationModal(false);
            })
            .catch(error => {
              console.error('Error en búsqueda:', error);
              if (!selectedSpot) {
                setParkingSpots([]);
              }
              handleLocationSkip();
            });
        });
      }
    } catch (error) {
      debug('❌ Error al obtener ubicación:', error);
      // En caso de error, solo limpiar si no hay spot seleccionado
      if (!selectedSpot) {
        setParkingSpots([]);
      }
      handleLocationSkip();
    }
  }, [getCurrentLocation, updateUser, mapInstance, searchNearbyParking, setParkingSpots, setTargetLocation, handleLocationSkip, selectedSpot]);

  // Verificar similitud de ubicaciones
  const isSimilarLocation = useCallback((location1, location2, threshold = 100) => {
    if (!location1 || !location2 || !isLoaded || !window.google?.maps?.geometry?.spherical) return false;

    try {
      const p1 = new window.google.maps.LatLng(
        parseFloat(location1.lat),
        parseFloat(location1.lng)
      );
      const p2 = new window.google.maps.LatLng(
        parseFloat(location2.lat),
        parseFloat(location2.lng)
      );

      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      return distance < threshold;
    } catch {
      return false;
    }
  }, [isLoaded]);

  // Inicialización automática
  useEffect(() => {
    if (!mapInstance || !userLoc) return;

    const isDefaultLocation =
      userLoc.lat === MAP_CONSTANTS.DEFAULT_LOCATION.lat &&
      userLoc.lng === MAP_CONSTANTS.DEFAULT_LOCATION.lng;

    // Si es una búsqueda forzada desde el HomePage, ignoramos las verificaciones de inicialización
    const urlParams = new URLSearchParams(window.location.search);
    const forceSearch = urlParams.get('forceSearch') === 'true';
    const searchLat = urlParams.get('lat');
    const searchLng = urlParams.get('lng');
    const fromHomePage = urlParams.get('source') === 'search';

    // Si ya se realizó una búsqueda desde HomePage, no inicializar automáticamente
    if (sessionStorage.getItem('initialHomePageSearch') === 'true') {
      hasInitialized.current = true;
      return;
    }

    // Verificar si ya tenemos una búsqueda en curso
    if (isSearchingRef.current) {
      debug('🔄 Búsqueda en curso, omitiendo inicialización');
      return;
    }

    // Si es una búsqueda forzada con coordenadas válidas
    if (forceSearch && searchLat && searchLng) {
      const searchLocation = {
        lat: parseFloat(searchLat),
        lng: parseFloat(searchLng)
      };

      if (!isFinite(searchLocation.lat) || !isFinite(searchLocation.lng)) {
        debug('❌ Coordenadas de búsqueda forzada inválidas');
        return;
      }

      debug('🔍 Realizando búsqueda forzada desde HomePage');
      hasInitialized.current = true;
      isSearchingRef.current = true;

      // Verificar caché primero
      const cachedResults = getCachedResult(searchLocation);
      if (cachedResults?.spots?.length > 0) {
        debug('📦 Usando resultados en caché para búsqueda forzada');
        setParkingSpots(cachedResults.spots);
        lastSearchLocationRef.current = searchLocation;
        lastIdleTimeRef.current = Date.now();

        // Asegurar que el mapa esté centrado y visible
        requestAnimationFrame(() => {
          mapInstance.panTo(searchLocation);
          mapInstance.setZoom(15);

          // Forzar una actualización visual
          setTimeout(() => {
            mapInstance.panBy(1, 0);
            setTimeout(() => {
              mapInstance.panBy(-1, 0);
            }, 50);
          }, 100);
        });

        isSearchingRef.current = false;

        if (fromHomePage) {
          sessionStorage.setItem('initialHomePageSearch', 'true');
        }
        return;
      }

      // Si no hay caché, hacer la búsqueda
      mapInstance.panTo(searchLocation);
      mapInstance.setZoom(15);

      searchNearbyParking(searchLocation, 15, false)
        .then(() => {
          if (fromHomePage) {
            sessionStorage.setItem('initialHomePageSearch', 'true');
          }
        })
        .finally(() => {
          isSearchingRef.current = false;
        });
      return;
    }

    // Lógica normal de inicialización
    if (hasInitialized.current || isDefaultLocation) {
      debug('📍 No inicializando búsqueda - Ya inicializado o ubicación por defecto');
      return;
    }

    hasInitialized.current = true;
    const initDelay = 400;

    // Verificar caché antes de cualquier búsqueda
    const cachedResults = getCachedResult(userLoc);
    if (cachedResults?.spots?.length > 0) {
      debug('📦 Usando resultados en caché para inicialización');
      setParkingSpots(cachedResults.spots);
      lastSearchLocationRef.current = userLoc;
      lastIdleTimeRef.current = Date.now();

      requestAnimationFrame(() => {
        mapInstance.panTo(userLoc);
        mapInstance.setZoom(15);

        // Forzar una actualización visual
        setTimeout(() => {
          mapInstance.panBy(1, 0);
          setTimeout(() => {
            mapInstance.panBy(-1, 0);
          }, 50);
        }, 100);
      });
      return;
    }

    // Solo si no hay caché, realizar la búsqueda
    setTimeout(() => {
      if (!isSearchingRef.current) {
        isSearchingRef.current = true;
        searchNearbyParking(userLoc, 15, false)
          .then(() => {
            lastSearchLocationRef.current = userLoc;
            lastIdleTimeRef.current = Date.now();

            requestAnimationFrame(() => {
              mapInstance.panTo(userLoc);
              mapInstance.setZoom(15);

              // Forzar una actualización visual
              setTimeout(() => {
                mapInstance.panBy(1, 0);
                setTimeout(() => {
                  mapInstance.panBy(-1, 0);
                }, 50);
              }, 100);
            });
          })
          .finally(() => {
            isSearchingRef.current = false;
          });
      }
    }, initDelay);
  }, [mapInstance, userLoc, searchNearbyParking, getCachedResult, setParkingSpots]);

  // Manejar estado de inactividad del mapa
  const handleMapIdle = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromHomePage = urlParams.get('source') === 'search';

    // Si venimos del HomePage y ya se hizo la búsqueda inicial, no mostrar el botón automáticamente
    if (fromHomePage && sessionStorage.getItem('initialHomePageSearch') === 'true') {
      return;
    }

    if (!mapInstance || isMarkerInteractionRef.current || isSearchingRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastIdleTimeRef.current < MIN_IDLE_INTERVAL) {
      return;
    }

    const center = mapInstance.getCenter();
    if (!center) return;

    const newLocation = {
      lat: center.lat(),
      lng: center.lng()
    };

    // Si el mapa está en movimiento o tenemos un spot seleccionado, no mostrar el botón
    if (isMapMoving || selectedSpot) {
      return;
    }

    const currentZoom = mapInstance.getZoom();
    const hasZoomChangedSignificantly = Math.abs((lastZoomLevel.current || 0) - currentZoom) >= 3;
    const SIGNIFICANT_DISTANCE_CHANGE = 500; // Aumentado a 500 metros

    const isLocationDistant = !lastSearchLocationRef.current ||
                            !isSimilarLocation(newLocation, lastSearchLocationRef.current, SIGNIFICANT_DISTANCE_CHANGE);

    // Solo actualizar el zoom si realmente cambió
    if (currentZoom !== lastZoomLevel.current) {
      lastZoomLevel.current = currentZoom;
    }

    // Mostrar el botón solo si:
    // 1. La ubicación ha cambiado significativamente (más de 500m)
    // 2. El zoom ha cambiado significativamente (3 o más niveles)
    // 3. No hay una búsqueda en curso
    // 4. No hay un spot seleccionado
    if ((isLocationDistant || hasZoomChangedSignificantly) &&
        !isSearchingRef.current &&
        !selectedSpot &&
        !isMapMoving) {
      searchHereLocationRef.current = newLocation;
      setShowSearchHereButton(true);
    } else if (!isLocationDistant && !hasZoomChangedSignificantly) {
      setShowSearchHereButton(false);
    }

    lastIdleTimeRef.current = now;
  }, [mapInstance, isMapMoving, isSimilarLocation, selectedSpot]);

  // Modificar handleSearchHereClick para mantener los marcadores correctamente
  const handleSearchHereClick = useCallback(() => {
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    if (!center) return;

    setShowSearchHereButton(false);

    const locationToSearch = {
      lat: center.lat(),
      lng: center.lng()
    };

    // Primero actualizar el contexto
    searchNearbyParking(locationToSearch, mapInstance.getZoom(), false, true)
      .then((results) => {
        if (results?.length > 0) {
          setParkingSpots(results); // Actualizar el contexto primero
          lastSearchLocationRef.current = locationToSearch;
          lastIdleTimeRef.current = Date.now();

          // Luego actualizar los marcadores
          updateMarkers(results);
        }
      })
      .catch((error) => {
        console.error('Error en búsqueda:', error);
        setParkingSpots([]);
        clearMarkers();
      });
  }, [mapInstance, searchNearbyParking, setParkingSpots, clearMarkers, updateMarkers]);

  // Manejar click en el mapa
  const handleMapClick = useCallback((event) => {
    if (!event?.domEvent?.target) return;

    const target = event.domEvent.target;
    // Solo cerrar el InfoWindow si el clic fue fuera de un marcador o InfoWindow
    if (target.closest('.gm-style') &&
        !target.closest('.marker-content') &&
        !target.closest('.info-window')) {
      setSelectedSpot(null);
      setShowSearchHereButton(true);
    }
  }, []);

  // Manejar movimiento del mapa
  const handleMapDragStart = useCallback(() => {
    setIsMapMoving(true);
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
      mapMoveTimeoutRef.current = null;
    }
  }, []);

  const handleMapDragEnd = useCallback(() => {
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
      mapMoveTimeoutRef.current = null;
    }

    mapMoveTimeoutRef.current = setTimeout(() => {
      setIsMapMoving(false);
      mapInstance?.handleMapIdle?.();
    }, 500);
  }, [mapInstance]);

  // Manejar zoom del mapa
  const handleMapZoomChanged = useCallback(() => {
    if (!mapInstance) return;
  }, [mapInstance]);

  // Centrar mapa en ubicación objetivo
  useEffect(() => {
    if (shouldCenterMap && mapInstance && contextTargetLocation) {
      requestAnimationFrame(() => {
        const position = {
          lat: parseFloat(contextTargetLocation.lat),
          lng: parseFloat(contextTargetLocation.lng)
        };

        if (!isFinite(position.lat) || !isFinite(position.lng)) return;

        const zoomLevel = 15;

        // Ocultar el botón de búsqueda ya que acabamos de buscar en esta ubicación
        setShowSearchHereButton(false);
        lastSearchLocationRef.current = position;
        lastIdleTimeRef.current = Date.now();

        mapInstance.panTo(position);
        mapInstance.setZoom(zoomLevel);

        const hasNoParking = !contextParkingSpots || contextParkingSpots.length === 0;

        if (hasNoParking) {
          clearMarkers();
        }

        setShouldCenterMap(false);
      });
    }
  }, [shouldCenterMap, mapInstance, contextTargetLocation, setShouldCenterMap, clearMarkers, contextParkingSpots]);

  // Manejar actualizaciones forzadas
  useEffect(() => {
    if (forceMapUpdate && mapInstance && effectiveTargetLocation) {
      const position = {
        lat: parseFloat(effectiveTargetLocation.lat),
        lng: parseFloat(effectiveTargetLocation.lng)
      };

      if (!isFinite(position.lat) || !isFinite(position.lng)) return;

      // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado
      requestAnimationFrame(() => {
        // Ocultar el botón de búsqueda ya que acabamos de buscar en esta ubicación
        setShowSearchHereButton(false);
        lastSearchLocationRef.current = position;
        lastIdleTimeRef.current = Date.now();

        mapInstance.panTo(position);
        mapInstance.setZoom(15);

        setForceMapUpdate(false);
      });
    }
  }, [forceMapUpdate, effectiveTargetLocation, mapInstance, setForceMapUpdate]);

  // Efecto para limpiar timeouts
  useEffect(() => {
    return () => {
      const timeouts = [
        mapMoveTimeoutRef,
        markerInteractionTimeoutRef
      ];

      timeouts.forEach(timeout => {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
      });

      // Limpiar marcadores al desmontar
      clearMarkers();
    };
  }, [clearMarkers]);

  // Optimizar manejo de marcador de usuario
  useEffect(() => {
    if (!mapInstance || !userLoc?.lat || !userLoc?.lng ||
        !isFinite(userLoc.lat) || !isFinite(userLoc.lng) ||
        !isLoaded || !window.google?.maps?.marker) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      return;
    }

    const position = {
      lat: parseFloat(userLoc.lat),
      lng: parseFloat(userLoc.lng)
    };

    // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado
    requestAnimationFrame(() => {
      // Reutilizar el marcador si ya existe
      if (userMarkerRef.current) {
        userMarkerRef.current.position = position;
        return;
      }

      // Crear el marcador solo si no existe
      const content = document.createElement('div');
      content.className = 'user-marker';
      Object.assign(content.style, {
        width: '16px',
        height: '16px',
        backgroundColor: '#3B82F6',
        border: '2px solid #FFFFFF',
        borderRadius: '50%',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
        willChange: 'transform'
      });

      if (window.google?.maps?.marker?.AdvancedMarkerElement) {
        userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
          position,
          map: mapInstance,
          content,
          zIndex: 1000
        });
      }
    });

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
    };
  }, [mapInstance, userLoc, isLoaded]);

  // Exponer funciones a través de useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleCardClick: (spot) => {
      if (!spot || !mapInstance) return;

      const position = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      if (!isFinite(position.lat) || !isFinite(position.lng)) return;

      // Prevenir múltiples interacciones rápidas
      if (isMarkerInteractionRef.current) return;
      isMarkerInteractionRef.current = true;

      // Asegurarnos de que los marcadores estén actualizados
      if (contextParkingSpots?.length > 0) {
        updateMarkers(contextParkingSpots);
      }

      // Actualizar el marcador seleccionado visualmente
      markSpotAsSelected(spot);
      setSelectedSpot(spot);

      // Ajustar el mapa para el InfoWindow
      adjustMapForInfoWindow(new window.google.maps.LatLng(position));

      // Ocultar el botón de búsqueda
      setShowSearchHereButton(false);

      // Permitir nuevas interacciones después de un delay
      setTimeout(() => {
        isMarkerInteractionRef.current = false;
      }, 300);
    },
    searchNearbyParking: async (location) => {
      if (!location || !mapInstance) return;

      setShowSearchHereButton(false);
      setSelectedSpot(null);

      // Limpiar marcadores existentes antes de la búsqueda
      clearMarkers();

      const cachedResults = getCachedResult(location);
      if (cachedResults?.spots?.length > 0) {
        setParkingSpots(cachedResults.spots);
        lastSearchLocationRef.current = location;
        lastIdleTimeRef.current = Date.now();

        // Actualizar los marcadores con los resultados en caché
        updateMarkers(cachedResults.spots);

        mapInstance.setZoom(15);
        mapInstance.panTo({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        });

        return cachedResults.spots;
      }

      try {
        const results = await searchNearbyParking(location, 15, false, true);
        if (results?.length > 0) {
          setParkingSpots(results);
          lastSearchLocationRef.current = location;
          lastIdleTimeRef.current = Date.now();

          // Actualizar los marcadores con los nuevos resultados
          updateMarkers(results);
        }

        return results;
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setParkingSpots([]);
        clearMarkers();
        throw error;
      }
    },
    getMapRef: () => mapInstance,
    cleanupMarkers: () => {
      clearMarkers();
      setParkingSpots([]);
      setSelectedSpot(null);
    }
  }), [mapInstance, contextParkingSpots, markSpotAsSelected, adjustMapForInfoWindow, updateMarkers, getCachedResult, setParkingSpots, searchNearbyParking, clearMarkers]);

  // Botón de localización
  const locateUserButton = useMemo(() => (
    <button
      onClick={requestUserLocation}
      className="absolute left-4 p-3 bg-white text-primary rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 z-50 border border-gray-100 bottom-4 md:bottom-4"
      aria-label="Localizar mi ubicación"
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        willChange: 'transform'
      }}
    >
      <BiTargetLock size={24} />
    </button>
  ), [requestUserLocation]);

  // Botón "Buscar en esta área"
  const searchHereButton = useMemo(() => (
    showSearchHereButton && (
      <button
        onClick={handleSearchHereClick}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 py-1.5 px-3 bg-white/90 backdrop-blur-sm text-primary rounded-full shadow-md hover:bg-white/95 transition-all duration-300 z-50 border border-gray-200/50 flex items-center space-x-2"
        aria-label="Buscar parqueaderos en esta área"
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <FaSearch size={12} className="text-primary/80" />
        <span className="font-medium text-sm">Buscar en esta área</span>
      </button>
    )
  ), [showSearchHereButton, handleSearchHereClick]);

  // Optimizar opciones del mapa
  const mapOptions = useMemo(() => {
    // Verificar que la API de Google Maps esté cargada
    if (!isLoaded || !window.google?.maps) {
      return {
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        clickableIcons: false,
        tilt: 0,
        backgroundColor: '#fff',
        maxZoom: 20,
        minZoom: 3,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
        optimized: true
      };
    }

    // Detectar si estamos en móvil
    const isMobile = window.innerWidth <= 768;

    return {
      ...MAP_CONSTANTS.MAP_OPTIONS,
      mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      clickableIcons: false,
      tilt: 0,
      backgroundColor: '#fff',
      maxZoom: isMobile ? 18 : 20,
      minZoom: isMobile ? 10 : 3,
      mapTypeId: 'roadmap',
      gestureHandling: isMobile ? 'greedy' : 'cooperative',
      optimized: true,
      renderer: window.google.maps.RenderingType?.WEBGL || 'webgl',
      animation: window.google.maps.Animation?.DROP,
      // Opciones específicas para móvil
      ...(isMobile && {
        gestureHandling: 'greedy',
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        // Mejorar rendimiento en móvil
        maxZoom: 18,
        minZoom: 10,
        // Optimizar para táctil
        tilt: 0,
        heading: 0,
        // Mejorar interacción táctil
        clickableIcons: false,
        // Reducir la frecuencia de actualizaciones
        updateInterval: 1000,
        // Forzar renderizado de marcadores
        renderer: window.google.maps.RenderingType?.WEBGL || 'webgl',
        // Asegurar que los marcadores sean visibles
        optimized: false
      })
    };
  }, [isLoaded]);

  // Optimizar estilos del contenedor
  const containerStyles = useMemo(() => {
    const isMobile = window.innerWidth <= 768;

    return {
      mapContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        contain: 'layout style paint',
        touchAction: isMobile ? 'pan-x pan-y' : 'none',
        WebkitOverflowScrolling: 'touch',
        userSelect: 'none',
        willChange: 'transform',
        // Optimizaciones específicas para móvil
        ...(isMobile && {
          WebkitTapHighlightColor: 'transparent',
          // Mejorar rendimiento de scroll
          WebkitOverflowScrolling: 'touch',
          // Optimizar para GPU
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        })
      },
      outerContainer: {
        touchAction: isMobile ? 'pan-x pan-y' : 'none',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        contain: 'layout style',
        // Optimizaciones específicas para móvil
        ...(isMobile && {
          WebkitOverflowScrolling: 'touch',
          // Optimizar para GPU
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        })
      },
      innerContainer: {
        touchAction: isMobile ? 'pan-x pan-y' : 'none',
        WebkitTapHighlightColor: 'transparent',
        contain: 'layout style',
        // Optimizaciones específicas para móvil
        ...(isMobile && {
          WebkitOverflowScrolling: 'touch',
          // Optimizar para GPU
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        })
      }
    };
  }, []);

  const { mapContainer, outerContainer, innerContainer } = containerStyles;

  const mapContainerProps = useMemo(() => ({
    className: "relative h-full w-full flex flex-col",
    style: outerContainer
  }), [outerContainer]);

  const mapInnerContainerProps = useMemo(() => ({
    className: "flex-1 relative w-full h-full google-map",
    style: innerContainer
  }), [innerContainer]);

  // Manejar eventos táctiles específicamente para móvil
  const handleMapTouchStart = useCallback((event) => {
    if (!event?.domEvent?.target) return;

    const target = event.domEvent.target;
    // Solo cerrar el InfoWindow si el clic fue fuera de un marcador o InfoWindow
    if (target.closest('.gm-style') &&
        !target.closest('.marker-content') &&
        !target.closest('.info-window')) {
      setSelectedSpot(null);
      setShowSearchHereButton(true);
    }
  }, []);

  // Cargar el mapa
  const handleMapLoad = useCallback((map) => {
    if (!map) return;

    originalHandleMapLoad(map);
    setMapInstance(map);

    // Asegurarnos de que la API de Google Maps esté disponible
    if (!window.google?.maps) {
      console.error('🗺️ Google Maps API no está disponible');
      return;
    }

    // Validar ubicación del usuario
    const validateLocation = (location) => {
      if (!location) return false;
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lng);
      return isFinite(lat) && isFinite(lng) &&
             lat >= -90 && lat <= 90 &&
             lng >= -180 && lng <= 180;
    };

    // Detectar si estamos en móvil
    const isMobile = window.innerWidth <= 768;

    // Solo mostrar el modal si:
    // 1. No se ha inicializado antes
    // 2. No tenemos ubicación del usuario O la ubicación es la default
    // 3. No tenemos una ubicación válida en el contexto
    const isDefaultLocation = userLoc &&
      userLoc.lat === MAP_CONSTANTS.DEFAULT_LOCATION.lat &&
      userLoc.lng === MAP_CONSTANTS.DEFAULT_LOCATION.lng;

    const hasValidLocation = userLoc &&
      !isDefaultLocation &&
      validateLocation(userLoc);

    if (!hasInitialized.current && !hasValidLocation) {
      debug('📍 Mostrando modal de ubicación - No hay ubicación válida');
      setShowLocationModal(true);
    } else {
      debug('📍 No es necesario mostrar modal de ubicación', {
        hasInitialized: hasInitialized.current,
        userLoc,
        hasValidLocation
      });
    }

    // Inicializar búsqueda si tenemos ubicación válida
    if (map && hasValidLocation) {
      // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado
      requestAnimationFrame(() => {
        // Ajustar el zoom inicial según el dispositivo
        const initialZoom = isMobile ? 17 : 15;

        searchNearbyParking(userLoc, initialZoom, false)
          .then(() => {
            map.setZoom(initialZoom);
            map.panTo(userLoc);

            // Forzar una actualización visual suave
            setTimeout(() => {
              // Forzar un pequeño movimiento para asegurar que los marcadores se rendericen
              map.panBy(1, 0);
              setTimeout(() => {
                map.panBy(-1, 0);
              }, 50);
            }, 100);

            // En móvil, forzar una segunda actualización después de un breve delay
            if (isMobile) {
              setTimeout(() => {
                map.panBy(0, 1);
                setTimeout(() => {
                  map.panBy(0, -1);
                }, 50);
              }, 300);
            }
          })
          .catch(error => {
            console.error('Error en búsqueda inicial:', error);
          });
      });
    }
  }, [originalHandleMapLoad, userLoc, searchNearbyParking, setShowLocationModal]);

  if (loadError) return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="text-gray-600">Error al cargar el mapa. Intente recargar la página.</div>
    </div>
  );

  if (!isLoaded) return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="text-gray-600">Cargando mapa...</div>
    </div>
  );

  return (
    <div {...mapContainerProps}>
      <div {...mapInnerContainerProps}>
        <GoogleMap
          mapContainerStyle={mapContainer}
          center={mapCenter}
          zoom={17}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          onTouchStart={handleMapTouchStart}
          onDragStart={handleMapDragStart}
          onDragEnd={handleMapDragEnd}
          onZoomChanged={handleMapZoomChanged}
          onIdle={handleMapIdle}
          options={mapOptions}
          mapContainerClassName="map-container"
        >
          {locateUserButton}
          {renderInfoWindow}
          {searchHereButton}
        </GoogleMap>
        {showLocationModal && (
          <LocationRequestModal
            onRequestLocation={requestUserLocation}
            onSkip={handleLocationSkip}
            isLoading={geoLoading}
            error={geoError}
          />
        )}
        <div className="flex-1 overflow-y-auto py-1.5">
          <ParkingCarousel
            parkingSpots={contextParkingSpots}
            onSelect={(spot) => {
              if (!spot || !mapInstance) return;

              const position = {
                lat: parseFloat(spot.latitude),
                lng: parseFloat(spot.longitude)
              };

              if (!isFinite(position.lat) || !isFinite(position.lng)) return;

              // Prevenir múltiples interacciones rápidas
              if (isMarkerInteractionRef.current) return;
              isMarkerInteractionRef.current = true;

              // Asegurarnos de que los marcadores estén actualizados
              if (contextParkingSpots?.length > 0) {
                updateMarkers(contextParkingSpots);
              }

              // Actualizar el marcador seleccionado visualmente
              markSpotAsSelected(spot);
              setSelectedSpot(spot);

              // Ajustar el mapa para el InfoWindow
              adjustMapForInfoWindow(new window.google.maps.LatLng(position));

              // Ocultar el botón de búsqueda
              setShowSearchHereButton(false);

              // Permitir nuevas interacciones después de un delay
              setTimeout(() => {
                isMarkerInteractionRef.current = false;
              }, 300);
            }}
            selectedSpotId={selectedSpot?.id}
          />
        </div>
      </div>
    </div>
  );
});

ParkingMap.propTypes = {
  onLocationChange: PropTypes.func,
};

ParkingMap.displayName = 'ParkingMap';
export default ParkingMap;
