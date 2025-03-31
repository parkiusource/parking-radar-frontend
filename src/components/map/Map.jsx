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
  const searchHereTimeoutRef = useRef(null);
  const isMarkerInteractionRef = useRef(false);
  const markerInteractionTimeoutRef = useRef(null);

  // Constantes
  const MIN_IDLE_INTERVAL = 1500; // Reducido de 3000ms a 1500ms

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
      zIndex: isSelected ? 2 : 1
    };
  }, [selectedSpotId]);

  // Usar useMapMarkers con la función getMarkerOptions
  const { clearMarkers } = useMapMarkers(
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

      // Centrar el mapa en la ubicación
      mapInstance.panTo(position);
      mapInstance.setZoom(17);

      if (onLocationChange) {
        onLocationChange(spot);
      }

      // Forzar actualización suave del mapa
      requestAnimationFrame(() => {
        mapInstance.panBy(0.5, 0);
        setTimeout(() => {
          mapInstance.panBy(-0.5, 0);
          // Permitir nuevas interacciones después de la animación
          isMarkerInteractionRef.current = false;
        }, 50);
      });

      // Ocultar el botón de búsqueda
      setShowSearchHereButton(false);
    }, [mapInstance, onLocationChange, markSpotAsSelected]),
    getMarkerOptions
  );

  // Función para limpiar todos los marcadores
  const cleanupMarkers = useCallback(() => {
    clearMarkers();
    if (mapInstance?.data) {
      mapInstance.data.forEach(feature => {
        mapInstance.data.remove(feature);
      });
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }
  }, [clearMarkers, mapInstance]);

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

  // Renderizar InfoWindow con la nueva lógica
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
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          maxWidth: 280,
          disableAutoPan: true, // Evitamos que el mapa se mueva automáticamente
          zIndex: 10 // Aseguramos que el InfoWindow siempre esté por encima
        }}
      >
        <ParkingInfoWindow
          spot={selectedSpot}
          onNavigate={() => openNavigation(selectedSpot.latitude, selectedSpot.longitude)}
        />
      </InfoWindowF>
    );
  }, [selectedSpot, handleInfoWindowClose, openNavigation]);

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
      if (!userLocation || !isFinite(userLocation.lat) || !isFinite(userLocation.lng)) {
        throw new Error('Ubicación inválida');
      }

      debug('📍 Ubicación obtenida:', userLocation);

      // Actualizar la ubicación del usuario
      updateUser({ location: userLocation });

      // Actualizar target location primero para que se actualice el contexto
      setTargetLocation(userLocation);

      // Centrar el mapa en la nueva ubicación con zoom específico
      if (mapInstance) {
        mapInstance.setZoom(15); // Cambiado de 16 a 15 para un mejor alcance inicial
        mapInstance.panTo(userLocation);
      }

      // Limpiar estado visual
      setSelectedSpot(null);
      setParkingSpots([]);

      // Esperar breve momento para que se actualice la UI
      await new Promise(resolve => setTimeout(resolve, 100));

      // Realizar búsqueda forzada ignorando caché
      debug('🔍 Realizando búsqueda forzada en ubicación actual');
      const results = await searchNearbyParking(userLocation, 16, false, true);

      // Si hay resultados, actualizar el estado
      if (results && results.length > 0) {
        // Actualizar el estado con los nuevos resultados
        setParkingSpots(results);
        lastSearchLocationRef.current = userLocation;
        lastIdleTimeRef.current = Date.now();
      } else {
        debug('⚠️ No se encontraron resultados');
      }

      setShowLocationModal(false);

      // Forzar actualización del mapa para refrescar los marcadores
      if (mapInstance) {
        setTimeout(() => {
          mapInstance.panBy(1, 0);
          setTimeout(() => mapInstance.panBy(-1, 0), 50);
        }, 200);
      }
    } catch (error) {
      debug('❌ Error al obtener ubicación:', error);
      // En caso de error, limpiar el estado y mostrar la ubicación por defecto
      setParkingSpots([]);
      setSelectedSpot(null);

      // Intentar con ubicación por defecto
      handleLocationSkip();
    }
  }, [getCurrentLocation, updateUser, mapInstance, searchNearbyParking, setParkingSpots, setTargetLocation, handleLocationSkip]);

  // Cargar el mapa
  const handleMapLoad = useCallback((map) => {
    originalHandleMapLoad(map);
    setMapInstance(map);

    // Solo mostrar el modal si:
    // 1. No se ha inicializado antes
    // 2. No tenemos ubicación del usuario O la ubicación es la default
    // 3. No tenemos una ubicación válida en el contexto
    const isDefaultLocation = userLoc &&
      userLoc.lat === MAP_CONSTANTS.DEFAULT_LOCATION.lat &&
      userLoc.lng === MAP_CONSTANTS.DEFAULT_LOCATION.lng;

    const hasValidLocation = userLoc &&
      !isDefaultLocation &&
      isFinite(userLoc.lat) &&
      isFinite(userLoc.lng);

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
      setTimeout(() => {
        searchNearbyParking(userLoc, 15, false)
          .then(() => {
            // Asegurar que el mapa esté centrado y visible
            requestAnimationFrame(() => {
              map.setZoom(15);
              map.panTo(userLoc);

              // Forzar una actualización visual
              setTimeout(() => {
                map.panBy(1, 0);
                setTimeout(() => {
                  map.panBy(-1, 0);
                }, 50);
              }, 100);
            });
          });
      }, 500);
    }
  }, [originalHandleMapLoad, userLoc, searchNearbyParking]);

  // Verificar similitud de ubicaciones
  const isSimilarLocation = useCallback((location1, location2, threshold = 100) => {
    if (!location1 || !location2) return false;

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
  }, []);

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
      if (cachedResults?.length > 0) {
        debug('📦 Usando resultados en caché para búsqueda forzada');
        setParkingSpots(cachedResults);
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
    if (cachedResults?.length > 0) {
      debug('📦 Usando resultados en caché para inicialización');
      setParkingSpots(cachedResults);
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

    // Si venimos del HomePage y ya se hizo la búsqueda inicial, permitir búsquedas manuales
    if (fromHomePage && sessionStorage.getItem('initialHomePageSearch') === 'true') {
      setShowSearchHereButton(true);
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

    // Si el mapa está en movimiento o tenemos un spot seleccionado, no buscar automáticamente
    if (isMapMoving || selectedSpot) {
      setShowSearchHereButton(true);
      searchHereLocationRef.current = newLocation;
      return;
    }

    const currentZoom = mapInstance.getZoom();
    const hasZoomChangedSignificantly = Math.abs((lastZoomLevel.current || 0) - currentZoom) >= 2;
    const SIGNIFICANT_DISTANCE_CHANGE = 300;
    const isLocationDistant = !lastSearchLocationRef.current ||
                            !isSimilarLocation(newLocation, lastSearchLocationRef.current, SIGNIFICANT_DISTANCE_CHANGE);

    lastZoomLevel.current = currentZoom;

    // Siempre mostrar el botón si la ubicación ha cambiado significativamente
    if (isLocationDistant || hasZoomChangedSignificantly) {
      searchHereLocationRef.current = newLocation;
      setShowSearchHereButton(true);
    }

    lastIdleTimeRef.current = now;
  }, [mapInstance, isMapMoving, isSimilarLocation, selectedSpot]);

  // Modificar handleSearchHereClick
  const handleSearchHereClick = useCallback(() => {
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    if (!center) return;

    setShowSearchHereButton(false);
    setSelectedSpot(null);

    const locationToSearch = {
      lat: center.lat(),
      lng: center.lng()
    };

    // Limpiar estado y marcadores
    setParkingSpots([]);
    cleanupMarkers();

    // Forzamos una nueva búsqueda ignorando el caché
    searchNearbyParking(locationToSearch, mapInstance.getZoom(), false, true)
      .then(() => {
        lastSearchLocationRef.current = locationToSearch;
        lastIdleTimeRef.current = Date.now();
      })
      .catch(() => {
        setParkingSpots([]);
        cleanupMarkers();
      });
  }, [mapInstance, searchNearbyParking, setParkingSpots, cleanupMarkers]);

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
      requestAnimationFrame(() => {
        const position = {
          lat: parseFloat(effectiveTargetLocation.lat),
          lng: parseFloat(effectiveTargetLocation.lng)
        };

        if (!isFinite(position.lat) || !isFinite(position.lng)) return;

        const zoomLevel = 15;

        // Ocultar el botón de búsqueda ya que acabamos de buscar en esta ubicación
        setShowSearchHereButton(false);
        lastSearchLocationRef.current = position;
        lastIdleTimeRef.current = Date.now();

        mapInstance.panTo(position);
        mapInstance.setZoom(zoomLevel);

        setForceMapUpdate(false);
      });
    }
  }, [forceMapUpdate, effectiveTargetLocation, mapInstance, setForceMapUpdate]);

  // Limpiar timeouts
  useEffect(() => {
    const timeouts = [
      mapMoveTimeoutRef,
      searchHereTimeoutRef,
      markerInteractionTimeoutRef
    ];

    return () => {
      timeouts.forEach(timeout => {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
      });
    };
  }, []);

  // Optimizar manejo de marcador de usuario
  useEffect(() => {
    if (!mapInstance || !userLoc?.lat || !userLoc?.lng ||
        !isFinite(userLoc.lat) || !isFinite(userLoc.lng)) {
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

    // Usar requestAnimationFrame para actualizar el marcador
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
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
      });

      userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        position,
        map: mapInstance,
        content,
        zIndex: 1000
      });
    });

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
    };
  }, [mapInstance, userLoc]);

  // Exponer funciones a través de useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleCardClick: (spot) => {
      if (!spot || !mapInstance) return;

      const spotLocation = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      if (!isFinite(spotLocation.lat) || !isFinite(spotLocation.lng)) return;

      // Prevenir múltiples interacciones rápidas
      if (isMarkerInteractionRef.current) return;
      isMarkerInteractionRef.current = true;

      // Actualizar el marcador seleccionado visualmente
      markSpotAsSelected(spot);

      // Asegurarnos de que el InfoWindow esté cerrado
      setSelectedSpot(null);

      // Usar requestAnimationFrame para asegurar que las actualizaciones visuales ocurran en el siguiente frame
      requestAnimationFrame(() => {
        // Centrar el mapa suavemente
        mapInstance.panTo(spotLocation);

        // Actualizar referencias de ubicación
        lastSearchLocationRef.current = spotLocation;
        lastIdleTimeRef.current = Date.now();

        // Hacer zoom después de un pequeño delay para que el movimiento sea más suave
        setTimeout(() => {
          mapInstance.setZoom(17);

          // Permitir nuevas interacciones después de que la animación se complete
          setTimeout(() => {
            isMarkerInteractionRef.current = false;
          }, 300);
        }, 100);
      });

      setShowSearchHereButton(false);
    },
    searchNearbyParking: async (location) => {
      if (!location || !mapInstance) return;

      setShowSearchHereButton(false);
      setSelectedSpot(null);

      const cachedResults = getCachedResult(location);
      if (cachedResults?.length > 0) {
        setParkingSpots(cachedResults);
        lastSearchLocationRef.current = location;
        lastIdleTimeRef.current = Date.now();

        mapInstance.setZoom(15);
        mapInstance.panTo({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        });

        return cachedResults;
      }

      setParkingSpots([]);
      cleanupMarkers();

      mapInstance.setZoom(15);
      mapInstance.panTo({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      });

      try {
        const results = await searchNearbyParking(location, 15, false, true);
        lastSearchLocationRef.current = location;
        lastIdleTimeRef.current = Date.now();
        return results;
      } catch (error) {
        setParkingSpots([]);
        cleanupMarkers();
        throw error;
      }
    },
    getMapRef: () => mapInstance,
    cleanupMarkers: () => {
      cleanupMarkers();
      setParkingSpots([]);
      setSelectedSpot(null);
    }
  }), [
    mapInstance,
    searchNearbyParking,
    markSpotAsSelected,
    getCachedResult,
    setParkingSpots,
    cleanupMarkers
  ]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('initialHomePageSearch');
      cleanupMarkers();
    };
  }, [cleanupMarkers]);

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
  const mapOptions = useMemo(() => ({
    ...MAP_CONSTANTS.MAP_OPTIONS,
    mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
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
  }), []);

  // Optimizar estilos del contenedor
  const containerStyles = useMemo(() => ({
    mapContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      contain: 'layout style paint',
      touchAction: 'none',
      WebkitOverflowScrolling: 'touch',
      userSelect: 'none'
    },
    outerContainer: {
      touchAction: 'none',
      WebkitTapHighlightColor: 'transparent',
      WebkitUserSelect: 'none',
      userSelect: 'none'
    },
    innerContainer: {
      touchAction: 'none',
      WebkitTapHighlightColor: 'transparent'
    }
  }), []);

  const { mapContainer, outerContainer, innerContainer } = containerStyles;

  const mapContainerProps = useMemo(() => ({
    className: "relative h-full w-full flex flex-col",
    style: outerContainer
  }), [outerContainer]);

  const mapInnerContainerProps = useMemo(() => ({
    className: "flex-1 relative w-full h-full google-map",
    style: innerContainer
  }), [innerContainer]);

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
      </div>
    </div>
  );
});

ParkingMap.propTypes = {
  onLocationChange: PropTypes.func,
};

ParkingMap.displayName = 'ParkingMap';
export default ParkingMap;
