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
import { useSearchState } from '@/hooks/useSearchState';
import { ParkingContext } from '@/context/parkingContextUtils';
import { UserContext } from '@/context/userContextDefinition';
import { MAP_CONSTANTS } from '@/constants/map';
import { useMap } from '@/hooks/useMap';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import { useParkingSearch } from '@/hooks/useParkingSearch';
import ParkingInfoWindow from './ParkingInfoWindow';

// Función de debug que solo muestra logs en desarrollo
const debug = (message, data) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

const debugError = (message, error) => {
  if (import.meta.env.DEV) {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
};

// Convertir a forwardRef para poder recibir la ref desde el componente padre
const ParkingMap = forwardRef(({ onLocationChange }, ref) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: MAP_CONSTANTS.LIBRARIES,
    mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID]
  });

  const { user, updateUser } = useContext(UserContext);
  const { location: userLoc } = user || {};
  const { getCachedResult, setCachedResult } = useSearchState();
  const {
    parkingSpots: contextParkingSpots,
    targetLocation: contextTargetLocation,
    getUserLocation,
    shouldCenterMap,
    setShouldCenterMap,
    setParkingSpots
  } = useContext(ParkingContext);
  const mapRef = useRef(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const lastClickTime = useRef(0);
  const [mapInstance, setMapInstance] = useState(null);
  const hasInitialized = useRef(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const mapMoveTimeoutRef = useRef(null);
  const [lastLocateClickTime, setLastLocateClickTime] = useState(0);
  const [locateClickCount, setLocateClickCount] = useState(0);
  const lastSearchLocationRef = useRef(null);
  const userMarkerRef = useRef(null);
  const lastIdleTimeRef = useRef(0);
  const MIN_IDLE_INTERVAL = 2000; // 2 segundos entre búsquedas

  // Usar hooks personalizados
  const {
    handleMapLoad: originalHandleMapLoad,
    centerMapOnLocation,
    mapCenter,
    effectiveTargetLocation,
    forceMapUpdate,
    setForceMapUpdate
  } = useMap(userLoc, contextTargetLocation, userLoc);

  const handleMapLoad = useCallback((map) => {
    debug('🗺️ Mapa cargado:', map);
    originalHandleMapLoad(map);
    setMapInstance(map);
  }, [originalHandleMapLoad]);

  const { searchNearbyParking } = useParkingSearch(setParkingSpots, getCachedResult, setCachedResult);

  // Función para verificar si una ubicación es similar a la última búsqueda
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
    } catch (error) {
      debug('Error calculando distancia:', error);
      return false;
    }
  }, []);

  // Optimizar el manejador de inactividad del mapa
  const handleMapIdle = useCallback(() => {
    if (!mapInstance || isMarkerInteractionRef.current) return;

    const now = Date.now();
    if (now - lastIdleTimeRef.current < MIN_IDLE_INTERVAL) {
      debug('🕒 Demasiado pronto para una nueva búsqueda');
      return;
    }

    const center = mapInstance.getCenter();
    if (!center) return;

    const newLocation = {
      lat: center.lat(),
      lng: center.lng()
    };

    if (isMapMoving) {
      lastSearchLocationRef.current = newLocation;
      return;
    }

    // Verificar si la ubicación ha cambiado significativamente
    if (lastSearchLocationRef.current &&
        isSimilarLocation(newLocation, lastSearchLocationRef.current, 200)) { // Aumentamos el umbral a 200 metros
      debug('📍 Ubicación muy cercana a la última búsqueda, omitiendo...');
      return;
    }

    lastIdleTimeRef.current = now;
    lastSearchLocationRef.current = newLocation;
    const currentZoom = mapInstance.getZoom();

    let searchRadius;
    if (currentZoom >= 18) {
      searchRadius = 300;
    } else if (currentZoom >= 16) {
      searchRadius = 800;
    } else if (currentZoom >= 14) {
      searchRadius = 1500;
    } else {
      searchRadius = 2500;
    }

    debug('🔍 Realizando búsqueda por área:', {
      location: newLocation,
      zoom: currentZoom,
      radius: searchRadius,
      lastSearch: new Date(lastIdleTimeRef.current).toLocaleTimeString()
    });

    searchNearbyParking(newLocation, currentZoom, false);
  }, [mapInstance, isMapMoving, searchNearbyParking, isSimilarLocation]);

  // Optimizar el manejo del movimiento del mapa
  const handleMapDragStart = useCallback(() => {
    setIsMapMoving(true);
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
  }, []);

  // Referencia para controlar si estamos en una interacción de marcador
  const isMarkerInteractionRef = useRef(false);
  const markerInteractionTimeoutRef = useRef(null);

  const handleMapDragEnd = useCallback(() => {
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
    mapMoveTimeoutRef.current = setTimeout(() => {
      setIsMapMoving(false);
      if (mapInstance) {
        handleMapIdle();
      }
    }, 500);
  }, [mapInstance, handleMapIdle]);

  // Efecto para limpiar timeouts
  useEffect(() => {
    return () => {
      if (mapMoveTimeoutRef.current) {
        clearTimeout(mapMoveTimeoutRef.current);
      }
    };
  }, []);

  // Efecto para manejar la inicialización
  useEffect(() => {
    if (hasInitialized.current || !mapInstance || !userLoc) return;

    debug('🚀 Inicialización automática del mapa');
    hasInitialized.current = true;

    // Intentar obtener resultados del caché primero
    const cachedResults = getCachedResult(userLoc);
    if (cachedResults?.length > 0) {
      debug('Usando resultados en caché para la inicialización');
      setParkingSpots(cachedResults);
    } else {
      // Solo realizar la búsqueda si no hay resultados en caché
      searchNearbyParking(userLoc, 15, false);
    }
  }, [mapInstance, userLoc, searchNearbyParking, getCachedResult, setParkingSpots]);

  // Función optimizada para localizar al usuario
  const locateUser = useCallback(async () => {
    debug('🎯 Iniciando localización del usuario...');

    try {
      const now = Date.now();
      const timeSinceLastClick = now - lastLocateClickTime;

      if (timeSinceLastClick > 2000) {
        setLocateClickCount(0);
      }

      setLastLocateClickTime(now);
      setLocateClickCount(prev => prev + 1);

      const userLocation = await getUserLocation();
      if (!userLocation) {
        debugError('No se pudo obtener la ubicación del usuario');
        return;
      }

      updateUser({ location: userLocation });

      // Ajustar el zoom según el dispositivo y el número de clics
      const isMobile = window.innerWidth < 768;
      const baseZoom = isMobile ? 16 : 17;
      const maxZoom = 19;
      const zoomIncrement = 1;
      const newZoom = Math.min(baseZoom + (locateClickCount * zoomIncrement), maxZoom);

      if (mapInstance) {
        // Intentar usar caché primero
        const cachedResults = getCachedResult(userLocation);
        if (cachedResults?.length > 0) {
          setParkingSpots(cachedResults);
        }

        // Centrar el mapa con animación suave
        mapInstance.panTo({
          lat: userLocation.lat,
          lng: userLocation.lng
        });

        // Ajustar el zoom con una pequeña animación
        const currentZoom = mapInstance.getZoom();
        if (currentZoom !== newZoom) {
          mapInstance.setZoom(newZoom);
        }

        // Solo buscar si no hay resultados en caché
        if (!cachedResults?.length) {
          searchNearbyParking(userLocation, newZoom, false);
        }
      }

      centerMapOnLocation(userLocation);
    } catch (error) {
      debugError('Error localizando al usuario:', error);
    }
  }, [
    getUserLocation,
    updateUser,
    mapInstance,
    centerMapOnLocation,
    searchNearbyParking,
    getCachedResult,
    setParkingSpots,
    lastLocateClickTime,
    locateClickCount
  ]);

  // Memoizar el callback de navegación
  const openNavigation = useCallback((lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }, []);

  // Memoizar el callback para el cierre del InfoWindow
  const handleInfoWindowClose = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  // Memoizar el InfoWindow
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

  // Restaurar la referencia a los marcadores con manejo de interacción
  const { clearMarkers } = useMapMarkers(
    mapInstance,
    contextParkingSpots,
    useCallback((spot) => {
      debug('🎯 Marcador clickeado:', spot);

      if (!spot || !mapInstance) return;

      // Marcar que estamos en una interacción de marcador
      isMarkerInteractionRef.current = true;

      // Limpiar timeout anterior si existe
      if (markerInteractionTimeoutRef.current) {
        clearTimeout(markerInteractionTimeoutRef.current);
      }

      // Cerrar todos los InfoWindows inmediatamente
      setSelectedSpot(null);

      // Centrar el mapa en la nueva ubicación con animación suave
      requestAnimationFrame(() => {
        mapInstance.panTo({
          lat: parseFloat(spot.latitude),
          lng: parseFloat(spot.longitude)
        });
        mapInstance.setZoom(17);

        // Abrir el nuevo InfoWindow después de centrar el mapa
        setSelectedSpot(spot);
        if (onLocationChange) {
          onLocationChange(spot);
        }

        // Restaurar la posibilidad de búsquedas después de un tiempo
        markerInteractionTimeoutRef.current = setTimeout(() => {
          isMarkerInteractionRef.current = false;
        }, 1000); // Esperar 1 segundo después de la interacción
      });
    }, [mapInstance, onLocationChange])
  );

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (markerInteractionTimeoutRef.current) {
        clearTimeout(markerInteractionTimeoutRef.current);
      }
    };
  }, []);

  // Memoizar el manejador de clics en el mapa
  const handleMapClick = useCallback((event) => {
    if (!event?.domEvent?.target || isMarkerInteractionRef.current) return;

    if (event.domEvent.timeStamp - lastClickTime.current < 300) return;
    lastClickTime.current = event.domEvent.timeStamp;

    const target = event.domEvent.target;
    const isMapClick = target.closest('.gm-style') &&
                      !target.closest('.marker-content') &&
                      !target.closest('.info-window');

    if (isMapClick) {
      setSelectedSpot(null);
    }
  }, []);

  // Efecto para manejar el centrado automático del mapa
  useEffect(() => {
    if (shouldCenterMap && mapInstance && contextTargetLocation) {
      debug('🎯 Centrando mapa en ubicación objetivo:', contextTargetLocation);

      // Usar requestAnimationFrame para suavizar la transición
      requestAnimationFrame(() => {
        const position = {
          lat: parseFloat(contextTargetLocation.lat),
          lng: parseFloat(contextTargetLocation.lng)
        };

        // Validar coordenadas
        if (!isFinite(position.lat) || !isFinite(position.lng)) {
          debug('❌ Coordenadas inválidas para centrar el mapa');
          return;
        }

        // Ajustar zoom según el dispositivo y el contexto
        const isMobile = window.innerWidth < 768;
        const baseZoom = isMobile ? 16 : 17;
        const maxZoom = 19;
        const zoomLevel = Math.min(baseZoom, maxZoom);

        // Centrar el mapa con animación suave
        mapInstance.panTo(position);
        mapInstance.setZoom(zoomLevel);

        // Forzar una actualización de los marcadores
        if (contextParkingSpots?.length > 0) {
          clearMarkers();
        }

        setShouldCenterMap(false);
      });
    }
  }, [shouldCenterMap, mapInstance, contextTargetLocation, setShouldCenterMap, clearMarkers, contextParkingSpots]);

  // Efecto para manejar actualizaciones forzadas
  useEffect(() => {
    if (forceMapUpdate && mapRef.current && effectiveTargetLocation) {
      debug('🔄 Actualización forzada del mapa');

      // Usar requestAnimationFrame para suavizar la transición
      requestAnimationFrame(() => {
        const position = {
          lat: parseFloat(effectiveTargetLocation.lat),
          lng: parseFloat(effectiveTargetLocation.lng)
        };

        // Validar coordenadas
        if (!isFinite(position.lat) || !isFinite(position.lng)) {
          debug('❌ Coordenadas inválidas para actualización forzada');
          return;
        }

        // Ajustar zoom según el dispositivo
        const isMobile = window.innerWidth < 768;
        const zoomLevel = isMobile ? 16 : 17;

        // Centrar el mapa con animación suave
        mapInstance.panTo(position);
        mapInstance.setZoom(zoomLevel);

        setForceMapUpdate(false);
      });
    }
  }, [forceMapUpdate, effectiveTargetLocation, mapInstance, setForceMapUpdate]);

  // Efecto para manejar el marcador de ubicación del usuario
  useEffect(() => {
    if (!mapInstance || !userLoc) return;

    // Limpiar marcador anterior si existe
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Crear nuevo marcador
    const marker = new window.google.maps.Marker({
      position: {
        lat: parseFloat(userLoc.lat),
        lng: parseFloat(userLoc.lng)
      },
      map: mapInstance,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      zIndex: 1000
    });

    userMarkerRef.current = marker;

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
    };
  }, [mapInstance, userLoc]);

  // Exponer métodos para el componente padre
  useImperativeHandle(ref, () => ({
    handleCardClick: (spot) => {
      if (!spot || !mapInstance) return;

      // Cerrar todos los InfoWindows inmediatamente
      setSelectedSpot(null);

      // Centrar el mapa en la nueva ubicación con animación suave
      mapInstance.panTo({
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      });

      // Ajustar zoom según el dispositivo y contexto
      const isMobile = window.innerWidth < 768;
      const zoomLevel = isMobile ? 16 : 17;

      if (mapInstance.getZoom() !== zoomLevel) {
        mapInstance.setZoom(zoomLevel);
      }

      // Abrir el nuevo InfoWindow después de centrar el mapa
      requestAnimationFrame(() => {
        setSelectedSpot(spot);
        if (onLocationChange) {
          onLocationChange(spot);
        }
      });
    },
    centerOnSpot: (spot, showPopup = false) => {
      if (!spot || !mapInstance) return;

      const position = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      // Validar coordenadas
      if (!isFinite(position.lat) || !isFinite(position.lng)) {
        debug('❌ Coordenadas inválidas para centrar el mapa');
        return;
      }

      // Cerrar InfoWindow si no se debe mostrar
      if (!showPopup) {
        setSelectedSpot(null);
      }

      // Centrar con animación suave
      mapInstance.panTo(position);

      // Ajustar zoom según el contexto
      const isMobile = window.innerWidth < 768;
      const zoomLevel = showPopup ? (isMobile ? 16 : 17) : (isMobile ? 15 : 16);

      if (mapInstance.getZoom() !== zoomLevel) {
        mapInstance.setZoom(zoomLevel);
      }

      // Mostrar InfoWindow si es necesario
      if (showPopup) {
        requestAnimationFrame(() => {
          setSelectedSpot(spot);
        });
      }
    },
    centerOnSpotWithoutPopup: (spot) => {
      if (!spot || !mapInstance) return;

      const position = {
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      };

      // Validar coordenadas
      if (!isFinite(position.lat) || !isFinite(position.lng)) {
        debug('❌ Coordenadas inválidas para centrar el mapa');
        return;
      }

      // Cerrar cualquier InfoWindow abierto
      setSelectedSpot(null);

      // Ajustar el zoom según el dispositivo
      const isMobile = window.innerWidth < 768;
      const zoomLevel = isMobile ? 15 : 16;

      // Centrar y ajustar zoom
      mapInstance.panTo(position);
      if (mapInstance.getZoom() !== zoomLevel) {
        mapInstance.setZoom(zoomLevel);
      }
    },
    getMapRef: () => mapInstance,
    searchNearbyParking: (location) => {
      if (!location || !mapInstance) return;

      // Validar coordenadas
      if (!isFinite(location.lat) || !isFinite(location.lng)) {
        debug('❌ Coordenadas inválidas para búsqueda');
        return;
      }

      // Ejecutar todas las operaciones en secuencia
      setSelectedSpot(null);
      clearMarkers();

      // Ajustar zoom y posición
      const isMobile = window.innerWidth < 768;
      const zoomLevel = isMobile ? 15 : 16;

      mapInstance.panTo({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      });

      if (mapInstance.getZoom() !== zoomLevel) {
        mapInstance.setZoom(zoomLevel);
      }

      // Buscar parqueaderos
      searchNearbyParking(location, zoomLevel);
    }
  }), [mapInstance, onLocationChange, clearMarkers, searchNearbyParking]);

  // Memoizar el botón de localización
  const locateUserButton = useMemo(() => (
    <button
      onClick={locateUser}
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
  ), [locateUser]);

  // Memoizar las opciones del mapa
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

  // Memoizar el estilo del contenedor del mapa
  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    contain: 'layout style paint',
    touchAction: 'none',
    WebkitOverflowScrolling: 'touch',
    userSelect: 'none'
  }), []);

  // Memoizar el contenedor principal del mapa
  const mapContainerProps = useMemo(() => ({
    className: "relative h-full w-full flex flex-col",
    style: {
      touchAction: 'none',
      WebkitTapHighlightColor: 'transparent',
      WebkitUserSelect: 'none',
      userSelect: 'none'
    }
  }), []);

  const mapInnerContainerProps = useMemo(() => ({
    className: "flex-1 relative w-full h-full google-map",
    style: {
      touchAction: 'none',
      WebkitTapHighlightColor: 'transparent'
    }
  }), []);

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
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
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
        </GoogleMap>
      </div>
    </div>
  );
});

ParkingMap.propTypes = {
  onLocationChange: PropTypes.func,
};

ParkingMap.displayName = 'ParkingMap';
export default ParkingMap;
