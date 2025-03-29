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
import { GEOLOCATION_CONFIG } from '@/services/geolocationService';
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
    libraries: MAP_CONSTANTS.LIBRARIES
  });

  const { user, updateUser } = useContext(UserContext);
  const { location: userLoc } = user || {};
  const { getCachedResult, setCachedResult } = useSearchState();
  const { parkingSpots: contextParkingSpots, targetLocation: contextTargetLocation, setTargetLocation, setParkingSpots } =
    useContext(ParkingContext);
  const mapRef = useRef(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const lastClickTime = useRef(0);
  const [mapInstance, setMapInstance] = useState(null);
  // Flag para controlar la inicialización
  const hasInitialized = useRef(false);

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

  // Efecto para debuggear cambios en parkingSpots y mapInstance
  useEffect(() => {
    debug('🅿️ Parking spots actualizados:', contextParkingSpots);
    debug('🗺️ Estado actual del mapa:', mapInstance);
  }, [contextParkingSpots, mapInstance]);

  const { searchNearbyParking, lastSearchLocationRef } = useParkingSearch(setParkingSpots, getCachedResult, setCachedResult);

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

  // Restaurar la referencia a los marcadores
  // eslint-disable-next-line no-unused-vars
  const { markersRef, clearMarkers } = useMapMarkers(
    mapInstance,
    contextParkingSpots,
    useCallback((spot) => {
      debug('🎯 Marcador clickeado:', spot);

      if (!spot || !mapInstance) return;

      // Cerrar todos los InfoWindows inmediatamente
      setSelectedSpot(null);

      // Centrar el mapa en la nueva ubicación
      mapInstance.panTo({
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      });
      mapInstance.setZoom(17);

      // Abrir el nuevo InfoWindow después de centrar el mapa
      requestAnimationFrame(() => {
        setSelectedSpot(spot);
        if (onLocationChange) {
          onLocationChange(spot);
        }
      });
    }, [mapInstance, onLocationChange])
  );

  // Optimizar el efecto de cambio de ubicación
  useEffect(() => {
    if (!effectiveTargetLocation || !mapRef.current || !mapInstance) return;

    const currentLat = lastSearchLocationRef?.current?.lat;
    const currentLng = lastSearchLocationRef?.current?.lng;
    const newLat = effectiveTargetLocation.lat;
    const newLng = effectiveTargetLocation.lng;

    // Comparación más precisa de ubicaciones
    if (currentLat === newLat && currentLng === newLng) {
      return;
    }

    debug('🔄 Nueva ubicación detectada, iniciando búsqueda...', effectiveTargetLocation);

    // Limpiar marcadores y centrar el mapa inmediatamente
    clearMarkers();

    mapInstance.setZoom(15);
    mapInstance.panTo({
      lat: parseFloat(newLat),
      lng: parseFloat(newLng)
    });

    // Realizar la búsqueda inmediatamente
    searchNearbyParking(effectiveTargetLocation);

  }, [effectiveTargetLocation, mapInstance, searchNearbyParking, clearMarkers, lastSearchLocationRef]);

  // Optimizar el efecto de inicialización
  useEffect(() => {
    if (hasInitialized.current || !mapInstance || !userLoc) return;

    debug('🚀 Inicialización automática del mapa');
    hasInitialized.current = true;
    searchNearbyParking(userLoc);
  }, [mapInstance, userLoc, searchNearbyParking]);

  // Memoizar el manejador de clics en el mapa
  const handleMapClick = useCallback((event) => {
    if (!event?.domEvent?.target) return;

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

  // Función para localizar al usuario (optimizada)
  const locateUser = useCallback(() => {
    debug('🎯 Iniciando localización del usuario...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          const userLoc = { lat: latitude, lng: longitude };

          // Evitar actualización si es la misma ubicación
          if (lastSearchLocationRef.current?.lat === latitude &&
              lastSearchLocationRef.current?.lng === longitude) {
            return;
          }

          debug('📍 Ubicación obtenida:', { latitude, longitude });

          const handleUserLocation = async () => {
          if (setTargetLocation) setTargetLocation(null);
            updateUser({ location: userLoc });

            // Limpiar marcadores existentes
            clearMarkers();

            // Centrar el mapa inmediatamente
          centerMapOnLocation(userLoc);

            // Asegurar que el mapa está centrado
            if (mapInstance) {
              mapInstance.panTo({
                lat: latitude,
                lng: longitude
              });
              mapInstance.setZoom(15);
            }

            // Pequeña pausa para permitir que el mapa se centre
            await new Promise(resolve => setTimeout(resolve, 100));

            // Realizar la búsqueda
            searchNearbyParking(userLoc);
          };

          handleUserLocation();
        },
        (error) => {
          debugError('❌ Error obteniendo ubicación:', error);
        },
        GEOLOCATION_CONFIG
      );
    } else {
      debugError('❌ Geolocalización no soportada');
    }
  }, [setTargetLocation, updateUser, centerMapOnLocation, searchNearbyParking, lastSearchLocationRef, clearMarkers, mapInstance]);

  // Efecto para manejar actualizaciones forzadas
  useEffect(() => {
    if (forceMapUpdate && mapRef.current && effectiveTargetLocation) {
      centerMapOnLocation(effectiveTargetLocation);
      setForceMapUpdate(false);
    }
  }, [forceMapUpdate, effectiveTargetLocation, centerMapOnLocation, setForceMapUpdate]);

  // Exponer métodos para el componente padre
  useImperativeHandle(ref, () => ({
    handleCardClick: (spot) => {
      if (!spot || !mapInstance) return;

      // Cerrar todos los InfoWindows inmediatamente
      setSelectedSpot(null);

      // Centrar el mapa en la nueva ubicación
      mapInstance.panTo({
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      });
      mapInstance.setZoom(17);

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
      if (showPopup) {
        // Usar el mismo método para mantener consistencia
        ref.current.handleCardClick(spot);
      } else {
        // Cerrar cualquier InfoWindow abierto
        setSelectedSpot(null);
        mapInstance.panTo({
          lat: parseFloat(spot.latitude),
          lng: parseFloat(spot.longitude)
        });
        mapInstance.setZoom(17);
      }
    },
    centerOnSpotWithoutPopup: (spot) => {
      if (!spot || !mapInstance) return;
      // Cerrar cualquier InfoWindow abierto
      setSelectedSpot(null);
      mapInstance.panTo({
        lat: parseFloat(spot.latitude),
        lng: parseFloat(spot.longitude)
      });
      mapInstance.setZoom(17);
    },
    getMapRef: () => mapInstance,
    searchNearbyParking: (location) => {
      if (!location || !mapInstance) return;

      // Ejecutar todas las operaciones en secuencia sin delays
      setSelectedSpot(null);
      clearMarkers();

      mapInstance.setZoom(15);
      mapInstance.panTo({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      });

      // Buscar parqueaderos inmediatamente
      searchNearbyParking(location);
    }
  }), [mapInstance, onLocationChange, ref, clearMarkers, searchNearbyParking]);

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
  const mapOptions = useMemo(() => MAP_CONSTANTS.MAP_OPTIONS, []);

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
          options={mapOptions}
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
