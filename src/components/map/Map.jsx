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
    setParkingSpots
  } = useContext(ParkingContext);

  // Hook de geolocalización
  const { error: geoError, loading: geoLoading, getCurrentLocation } = useGeolocation();

  // Estados y referencias
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [showSearchHereButton, setShowSearchHereButton] = useState(false);

  const lastClickTime = useRef(0);
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
  const MARKER_INTERACTION_COOLDOWN = 5000; // 5 segundos de cooldown tras interacción

  // Inicializar hooks personalizados
  const { searchNearbyParking } = useParkingSearch(setParkingSpots, getCachedResult, setCachedResult);
  const {
    handleMapLoad: originalHandleMapLoad,
    centerMapOnLocation,
    mapCenter,
    effectiveTargetLocation,
    forceMapUpdate,
    setForceMapUpdate
  } = useMap(userLoc, contextTargetLocation, MAP_CONSTANTS.DEFAULT_LOCATION);

  // Marcadores
  const { clearMarkers, markers } = useMapMarkers(
    mapInstance,
    contextParkingSpots,
    useCallback((spot) => {
      if (!spot || !mapInstance) return;

      // Ocultar botón de búsqueda e iniciar interacción
      setShowSearchHereButton(false);
      isMarkerInteractionRef.current = true;

      if (markerInteractionTimeoutRef.current) {
        clearTimeout(markerInteractionTimeoutRef.current);
      }

      setSelectedSpot(null);

      requestAnimationFrame(() => {
        mapInstance.panTo({
          lat: parseFloat(spot.latitude),
          lng: parseFloat(spot.longitude)
        });
        mapInstance.setZoom(17);

        setSelectedSpot(spot);
        if (onLocationChange) {
          onLocationChange(spot);
        }

        markerInteractionTimeoutRef.current = setTimeout(() => {
          isMarkerInteractionRef.current = false;
        }, MARKER_INTERACTION_COOLDOWN);
      });
    }, [mapInstance, onLocationChange])
  );

  // Solicitar ubicación del usuario
  const requestUserLocation = useCallback(async () => {
    try {
      setShowSearchHereButton(false);
      const userLocation = await getCurrentLocation();

      // Verificar caché antes de hacer cualquier movimiento del mapa
      const cachedResults = getCachedResult(userLocation);

      // Actualizar la ubicación del usuario y centrar el mapa
      updateUser({ location: userLocation });
      centerMapOnLocation(userLocation);

      if (cachedResults?.length > 0) {
        debug('📦 Usando resultados en caché para la ubicación del usuario');
        setParkingSpots(cachedResults);
        lastSearchLocationRef.current = userLocation;
        lastIdleTimeRef.current = Date.now();
      } else {
        debug('🔍 No hay caché, realizando nueva búsqueda');
        await searchNearbyParking(userLocation);
        lastSearchLocationRef.current = userLocation;
        lastIdleTimeRef.current = Date.now();
      }

      setShowLocationModal(false);
    } catch (error) {
      debug('❌ Error al obtener ubicación', error);
    }
  }, [getCurrentLocation, updateUser, centerMapOnLocation, searchNearbyParking, getCachedResult, setParkingSpots]);

  // Manejar skip de ubicación
  const handleLocationSkip = useCallback(() => {
    setShowLocationModal(false);
    const defaultLocation = MAP_CONSTANTS.DEFAULT_LOCATION;

    // Verificar caché también para la ubicación por defecto
    const cachedResults = getCachedResult(defaultLocation);

    updateUser({ location: defaultLocation });
    centerMapOnLocation(defaultLocation);

    if (cachedResults?.length > 0) {
      debug('📦 Usando resultados en caché para la ubicación por defecto');
      setParkingSpots(cachedResults);
      lastSearchLocationRef.current = defaultLocation;
      lastIdleTimeRef.current = Date.now();
    } else {
      debug('🔍 No hay caché, realizando nueva búsqueda para ubicación por defecto');
      searchNearbyParking(defaultLocation);
    }
  }, [updateUser, centerMapOnLocation, searchNearbyParking, getCachedResult, setParkingSpots]);

  // Cargar el mapa
  const handleMapLoad = useCallback((map) => {
    originalHandleMapLoad(map);
    setMapInstance(map);

    // Solo mostrar el modal si:
    // 1. No se ha inicializado antes
    // 2. No tenemos ubicación del usuario O la ubicación es la default
    const isDefaultLocation = userLoc &&
      userLoc.lat === MAP_CONSTANTS.DEFAULT_LOCATION.lat &&
      userLoc.lng === MAP_CONSTANTS.DEFAULT_LOCATION.lng;

    if (!hasInitialized.current && (!userLoc || isDefaultLocation)) {
      debug('📍 Mostrando modal de ubicación - No hay ubicación válida');
      setShowLocationModal(true);
    } else {
      debug('📍 No es necesario mostrar modal de ubicación', { hasInitialized: hasInitialized.current, userLoc });
    }

    // Optimización para móviles
    const isMobile = window.innerWidth < 768;
    if (isMobile && map && userLoc && !isDefaultLocation) {
      setTimeout(() => {
        searchNearbyParking(userLoc, 17, false)
          .then(() => {
            setTimeout(() => {
              map.panBy(1, 0);
              setTimeout(() => map.panBy(-1, 0), 100);
            }, 500);
          });
      }, 1000);
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

  // Manejar estado de inactividad del mapa
  const handleMapIdle = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromHomePage = urlParams.get('source') === 'search';

    // Si venimos del HomePage y ya se hizo la búsqueda inicial, no hacer búsquedas automáticas
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

    if (isMapMoving) {
      return;
    }

    const currentZoom = mapInstance.getZoom();
    const hasZoomChangedSignificantly = Math.abs((lastZoomLevel.current || 0) - currentZoom) >= 2;
    const SIGNIFICANT_DISTANCE_CHANGE = 300;
    const isLocationDistant = !lastSearchLocationRef.current ||
                            !isSimilarLocation(newLocation, lastSearchLocationRef.current, SIGNIFICANT_DISTANCE_CHANGE);

    lastZoomLevel.current = currentZoom;

    const hasSelectedMarker = selectedSpot !== null;

    if (!hasSelectedMarker && (isLocationDistant || hasZoomChangedSignificantly)) {
      searchHereLocationRef.current = newLocation;

      if (searchHereTimeoutRef.current) {
        clearTimeout(searchHereTimeoutRef.current);
      }

      searchHereTimeoutRef.current = setTimeout(() => {
        if (!isSearchingRef.current) {
          setShowSearchHereButton(true);
        }
      }, 200);
    }

    lastIdleTimeRef.current = now;
  }, [mapInstance, isMapMoving, isSimilarLocation, selectedSpot]);

  // Buscar en el área actual
  const handleSearchHereClick = useCallback(() => {
    if (!mapInstance) return;

    setShowSearchHereButton(false);
    setSelectedSpot(null);

    const center = mapInstance.getCenter();
    const locationToSearch = {
      lat: center.lat(),
      lng: center.lng()
    };
    const currentZoom = mapInstance.getZoom();

    // Verificar caché antes de hacer la búsqueda
    const cachedResults = getCachedResult(locationToSearch);
    if (cachedResults?.length > 0) {
      debug('📦 Usando resultados en caché para búsqueda en área');
      setParkingSpots([]); // Primero limpiamos los spots
      requestAnimationFrame(() => {
        setParkingSpots(cachedResults); // Luego actualizamos con los nuevos
        lastSearchLocationRef.current = locationToSearch;
      });
    } else {
      debug('🔍 No hay caché, realizando nueva búsqueda');
      setParkingSpots([]); // Limpiamos los spots actuales
      lastSearchLocationRef.current = locationToSearch;
      searchNearbyParking(locationToSearch, currentZoom, false);
    }
  }, [mapInstance, searchNearbyParking, getCachedResult, setParkingSpots]);

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

  // Marcar spot como seleccionado
  const markSpotAsSelected = useCallback((spot) => {
    if (!spot || !contextParkingSpots) return;

    const updatedSpots = contextParkingSpots.map(existingSpot => {
      const cleanedSpot = { ...existingSpot, isSelected: false, wasRecentlyClicked: false };

      if (existingSpot.id === spot.id ||
          (existingSpot.googlePlaceId && existingSpot.googlePlaceId === spot.googlePlaceId)) {
        return {
          ...cleanedSpot,
          isSelected: true,
          wasRecentlyClicked: true,
          lastClickTime: Date.now()
        };
      }
      return cleanedSpot;
    });

    setParkingSpots(updatedSpots);
  }, [contextParkingSpots, setParkingSpots]);

  // Manejar cierre de InfoWindow
  const handleInfoWindowClose = useCallback(() => {
    if (selectedSpot) {
      const updatedSpots = contextParkingSpots.map(existingSpot => {
        if (existingSpot.id === selectedSpot.id ||
            (existingSpot.googlePlaceId && existingSpot.googlePlaceId === selectedSpot.googlePlaceId)) {
          return {
            ...existingSpot,
            isSelected: false,
            wasRecentlyClicked: true,
            lastClickTime: Date.now()
          };
        }
        return existingSpot;
      });

      setParkingSpots(updatedSpots);
    }

    setSelectedSpot(null);

    if (searchHereLocationRef.current) {
      setTimeout(() => {
        setShowSearchHereButton(true);
      }, 500);
    }
  }, [selectedSpot, contextParkingSpots, setParkingSpots]);

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

    if (forceSearch && searchLat && searchLng) {
      const searchLocation = {
        lat: parseFloat(searchLat),
        lng: parseFloat(searchLng)
      };

      debug('🔍 Realizando búsqueda forzada desde HomePage');
      hasInitialized.current = true;
      isSearchingRef.current = true;

      // Centrar mapa en la ubicación de búsqueda
      mapInstance.panTo(searchLocation);
      mapInstance.setZoom(17);

      // Realizar búsqueda
      searchNearbyParking(searchLocation, 17, false)
        .then(() => {
          // Marcar que ya se realizó la búsqueda inicial desde HomePage
          if (fromHomePage) {
            sessionStorage.setItem('initialHomePageSearch', 'true');
          }
        })
        .finally(() => {
          isSearchingRef.current = false;
        });
      return;
    }

    // Si ya se realizó una búsqueda desde HomePage, no inicializar automáticamente
    if (sessionStorage.getItem('initialHomePageSearch') === 'true') {
      hasInitialized.current = true;
      return;
    }

    // Lógica normal de inicialización
    if (hasInitialized.current) return;

    if (isDefaultLocation) {
      debug('📍 No inicializando búsqueda - Ubicación por defecto');
      return;
    }

    hasInitialized.current = true;
    const isMobile = window.innerWidth < 768;
    const initDelay = isMobile ? 800 : 0;

    setTimeout(() => {
      const cachedResults = getCachedResult(userLoc);
      if (cachedResults?.length > 0) {
        setParkingSpots(cachedResults);
        lastSearchLocationRef.current = userLoc;
        lastIdleTimeRef.current = Date.now();

        if (isMobile) {
          setTimeout(() => {
            mapInstance.panBy(1, 0);
            setTimeout(() => mapInstance.panBy(-1, 0), 100);
          }, 500);
        }
      } else {
        isSearchingRef.current = true;
        searchNearbyParking(userLoc, 17, false)
          .then(() => {
            lastSearchLocationRef.current = userLoc;
            lastIdleTimeRef.current = Date.now();

            if (isMobile) {
              setTimeout(() => {
                mapInstance.panBy(1, 0);
                setTimeout(() => mapInstance.panBy(-1, 0), 100);
              }, 300);
            }
          })
          .finally(() => {
            isSearchingRef.current = false;
          });
      }
    }, initDelay);
  }, [mapInstance, userLoc, searchNearbyParking, getCachedResult, setParkingSpots]);

  // Abrir navegación
  const openNavigation = useCallback((lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }, []);

  // Renderizar InfoWindow
  const renderInfoWindow = useMemo(() => {
    if (!selectedSpot) return null;

    return (
      <InfoWindowF
        position={{
          lat: parseFloat(selectedSpot.latitude),
          lng: parseFloat(selectedSpot.longitude),
        }}
        onCloseClick={handleInfoWindowClose}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          maxWidth: 280,
          disableAutoPan: false
        }}
      >
        <ParkingInfoWindow
          spot={selectedSpot}
          onNavigate={() => openNavigation(selectedSpot.latitude, selectedSpot.longitude)}
        />
      </InfoWindowF>
    );
  }, [selectedSpot, openNavigation, handleInfoWindowClose]);

  // Manejar click en el mapa
  const handleMapClick = useCallback((event) => {
    if (!event?.domEvent?.target ||
        isMarkerInteractionRef.current ||
        event.domEvent.timeStamp - lastClickTime.current < 300) {
      return;
    }

    lastClickTime.current = event.domEvent.timeStamp;
    const target = event.domEvent.target;

    if (target.closest('.gm-style') &&
        !target.closest('.marker-content') &&
        !target.closest('.info-window')) {
      setSelectedSpot(null);
    }
  }, []);

  // Centrar mapa en ubicación objetivo
  useEffect(() => {
    if (shouldCenterMap && mapInstance && contextTargetLocation) {
      requestAnimationFrame(() => {
        const position = {
          lat: parseFloat(contextTargetLocation.lat),
          lng: parseFloat(contextTargetLocation.lng)
        };

        if (!isFinite(position.lat) || !isFinite(position.lng)) return;

        const isMobile = window.innerWidth < 768;
        const baseZoom = isMobile ? 16 : 17;
        const zoomLevel = Math.min(baseZoom, 19);

        // Ocultar el botón de búsqueda ya que acabamos de buscar en esta ubicación
        setShowSearchHereButton(false);
        lastSearchLocationRef.current = position;
        lastIdleTimeRef.current = Date.now();

        mapInstance.panTo(position);
        mapInstance.setZoom(zoomLevel);

        const hasNoParking = !contextParkingSpots || contextParkingSpots.length === 0;
        const hasNoMarkers = !markers || markers.size === 0;

        if (hasNoParking && !hasNoMarkers) {
          clearMarkers();
        }

        setShouldCenterMap(false);
      });
    }
  }, [shouldCenterMap, mapInstance, contextTargetLocation, setShouldCenterMap, clearMarkers, contextParkingSpots, markers]);

  // Manejar actualizaciones forzadas
  useEffect(() => {
    if (forceMapUpdate && mapInstance && effectiveTargetLocation) {
      requestAnimationFrame(() => {
        const position = {
          lat: parseFloat(effectiveTargetLocation.lat),
          lng: parseFloat(effectiveTargetLocation.lng)
        };

        if (!isFinite(position.lat) || !isFinite(position.lng)) return;

        // Ocultar el botón de búsqueda ya que acabamos de buscar en esta ubicación
        setShowSearchHereButton(false);
        lastSearchLocationRef.current = position;
        lastIdleTimeRef.current = Date.now();

        const isMobile = window.innerWidth < 768;
        const zoomLevel = isMobile ? 16 : 17;

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

    // Reutilizar el marcador si ya existe y solo actualizar su posición
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

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
    };
  }, [mapInstance, userLoc]);

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    handleCardClick: (spot) => {
      if (!spot || !mapInstance) return;

      markSpotAsSelected(spot);
      setSelectedSpot(null);
      setShowSearchHereButton(false);

      const spotLocation = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      mapInstance.panTo(spotLocation);

      // Verificar caché antes de mostrar el spot
      const cachedResults = getCachedResult(spotLocation);
      if (cachedResults?.length > 0) {
        debug('📦 Usando resultados en caché para el spot seleccionado');
        setParkingSpots(cachedResults);
        lastSearchLocationRef.current = spotLocation;
        lastIdleTimeRef.current = Date.now();
      }

      requestAnimationFrame(() => {
        setSelectedSpot(spot);
        if (onLocationChange) onLocationChange(spot);
      });
    },
    centerOnSpot: (spot, showPopup = false) => {
      if (!spot || !mapInstance) return;

      setShowSearchHereButton(false);
      const spotLocation = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      // Verificar caché antes de centrar en el spot
      const cachedResults = getCachedResult(spotLocation);
      if (cachedResults?.length > 0) {
        debug('📦 Usando resultados en caché para centrar en spot');
        setParkingSpots(cachedResults);
        lastSearchLocationRef.current = spotLocation;
        lastIdleTimeRef.current = Date.now();
      }

      if (showPopup) {
        ref.current.handleCardClick(spot);
      } else {
        setSelectedSpot(null);
        mapInstance.panTo(spotLocation);
      }
    },
    centerOnSpotWithoutPopup: (spot) => {
      if (!spot || !mapInstance) return;

      setShowSearchHereButton(false);
      const spotLocation = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      // Verificar caché antes de centrar
      const cachedResults = getCachedResult(spotLocation);
      if (cachedResults?.length > 0) {
        debug('📦 Usando resultados en caché para centrar');
        setParkingSpots(cachedResults);
        lastSearchLocationRef.current = spotLocation;
        lastIdleTimeRef.current = Date.now();
      }

      setSelectedSpot(null);
      mapInstance.panTo(spotLocation);
    },
    getMapRef: () => mapInstance,
    searchNearbyParking: (location) => {
      if (!location || !mapInstance) return;

      setShowSearchHereButton(false);
      setSelectedSpot(null);

      // Verificar caché antes de hacer la búsqueda
      const cachedResults = getCachedResult(location);

      mapInstance.setZoom(15);
      mapInstance.panTo({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      });

      if (cachedResults?.length > 0) {
        debug('📦 Usando resultados en caché para búsqueda');
        setParkingSpots([]); // Primero limpiamos los spots
        requestAnimationFrame(() => {
          setParkingSpots(cachedResults); // Luego actualizamos con los nuevos
          lastSearchLocationRef.current = location;
          lastIdleTimeRef.current = Date.now();
        });
      } else {
        debug('🔍 No hay caché, realizando nueva búsqueda');
        setParkingSpots([]); // Limpiamos los spots actuales
        searchNearbyParking(location);
      }
    }
  }), [mapInstance, onLocationChange, ref, searchNearbyParking, markSpotAsSelected, getCachedResult, setParkingSpots]);

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

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Limpiar el estado de búsqueda inicial al desmontar el componente
      sessionStorage.removeItem('initialHomePageSearch');
    };
  }, []);

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
