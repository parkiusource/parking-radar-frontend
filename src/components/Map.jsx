import { GoogleMap, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { BiTargetLock } from 'react-icons/bi';
import { LuNavigation, LuMapPin, LuCar, LuDollarSign } from 'react-icons/lu';

import SvgParking from '@/assets/ComponentIcons/SvgParking';
import { Button } from '@/components/common';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LIBRARIES = ['marker'];
const DEFAULT_RADIUS = 30;
const DEFAULT_LOCATION = { lat: 4.711, lng: -74.0721 };
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;
const COLOR_NO_AVAILABLE = '#8B0000';
const COLOR_AVAILABLE = '#1B5E20';

const ParkingMap = memo(({ selectedSpot, setSelectedSpot, targetLocation: targetLocationProp }) => {
  const { parkingSpots, targetLocation: contextTargetLocation, setTargetLocation } =
    useContext(ParkingContext);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userCircleRef = useRef(null);

  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user;

  // Forzar la recarga del mapa para reforzar que use la ubicación adecuada
  const [mapKey, setMapKey] = useState(0);

  // Actualizar el mapKey cada vez que cambia la ubicación objetivo
  useEffect(() => {
    if (targetLocationProp) {
      setMapKey(prev => prev + 1);
    }
  }, [targetLocationProp]);

  // Ignorar completamente el contextTargetLocation cuando se proporciona targetLocationProp
  const effectiveTargetLocation = useMemo(() => {
    // Si hay una prop de ubicación objetivo, usarla directamente ignorando el contexto
    if (targetLocationProp) {
      return targetLocationProp;
    }
    // De lo contrario, usar el valor del contexto
    return contextTargetLocation;
  }, [targetLocationProp, contextTargetLocation]);

  const mapCenter = useMemo(() => {
    return effectiveTargetLocation || userLocation || DEFAULT_LOCATION;
  }, [effectiveTargetLocation, userLocation]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // Función simplificada para centrar el mapa en una ubicación
  const centerMapOnLocation = useCallback((location) => {
    if (!mapRef.current || !location) return;

    // Validar que la ubicación tiene coordenadas numéricas
    if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return;
    }

    // Centrar mapa usando múltiples métodos para garantizar que funcione
    try {
      mapRef.current.panTo(location);
      mapRef.current.setCenter(location);

      // Ajustar zoom a un valor óptimo
      setTimeout(() => {
        mapRef.current.setZoom(16);
      }, 100);
    } catch {
      // Manejo silencioso de errores en producción
    }
  }, []);

  const setUserLocation = useCallback(
    (location) => {
      updateUser({
        location,
      });
    },
    [updateUser],
  );

  const locateUser = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setTargetLocation(null);
        const userLoc = { lat: latitude, lng: longitude };
        setUserLocation(userLoc);
        centerMapOnLocation(userLoc);
      },
      (error) => console.error('Error fetching location:', error),
      { enableHighAccuracy: false },
    );
  };

  // Efecto unificado para centrar el mapa cuando cambia la ubicación objetivo
  useEffect(() => {
    if (effectiveTargetLocation && mapRef.current) {
      centerMapOnLocation(effectiveTargetLocation);
    }
  }, [effectiveTargetLocation, centerMapOnLocation]);

  // Efecto para mostrar la ubicación del usuario
  useEffect(() => {
    if (userLocation && mapRef.current && window.google) {
      // Solo centramos en la ubicación del usuario si no hay una ubicación objetivo
      if (!effectiveTargetLocation) {
        centerMapOnLocation(userLocation);
      }

      // Actualizar el círculo de la ubicación del usuario
      if (userCircleRef.current) userCircleRef.current.setMap(null);
      userCircleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center: userLocation,
        radius: DEFAULT_RADIUS,
        strokeColor: '#4285F4',
        fillColor: '#4285F4',
        fillOpacity: 0.35,
      });
    }
  }, [userLocation, centerMapOnLocation, effectiveTargetLocation]);

  const createMarkerContent = useCallback((spot) => {
    const markerContent = document.createElement('div');
    const color = spot.available_spaces > 0 ? COLOR_AVAILABLE : COLOR_NO_AVAILABLE;

    const root = createRoot(markerContent);

    root.render(
      <SvgParking
        style={{
          width: '35px',
          height: '45px',
          filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.2))',
          transition: 'all 0.3s ease'
        }}
        fill={color}
        className="parking-marker"
      />
    );

    return markerContent;
  }, []);

  const initializeMarkers = useCallback(async () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // eslint-disable-next-line no-undef
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

    parkingSpots.forEach((spot) => {
      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: spot.latitude, lng: spot.longitude },
        title: spot.name,
        content: createMarkerContent(spot),
      });

      // Añadir effect hover/active con JavaScript
      let isActive = false;

      marker.addListener('click', () => {
        // Reset all markers to normal
        markersRef.current.forEach(m => {
          if (m !== marker) {
            const markerDiv = m.content;
            if (markerDiv) {
              markerDiv.style.transform = 'scale(1)';
              markerDiv.style.zIndex = '1';
            }
          }
        });

        // Highlight selected marker
        const markerDiv = marker.content;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1.1)';
          markerDiv.style.zIndex = '10';
        }

        isActive = true;
        setSelectedSpot(spot);
        setInfoWindowOpen(true);
      });

      // Restaurar al hacer clic en el mapa
      window.google.maps.event.addListener(mapRef.current, 'click', () => {
        if (isActive) {
          const markerDiv = marker.content;
          if (markerDiv) {
            markerDiv.style.transform = 'scale(1)';
            markerDiv.style.zIndex = '1';
          }
          isActive = false;
        }
      });

      markersRef.current.push(marker);
    });
  }, [parkingSpots, setSelectedSpot, createMarkerContent]);

  useEffect(() => {
    if (isLoaded && mapRef.current) initializeMarkers();
    return () => markersRef.current.forEach((marker) => marker.setMap(null));
  }, [isLoaded, initializeMarkers]);

  useEffect(() => {
    if (selectedSpot) {
      const updatedSpot = parkingSpots.find(
        (spot) => spot.id === selectedSpot.id,
      );
      if (
        updatedSpot &&
        updatedSpot.available_spaces !== selectedSpot.available_spaces
      ) {
        setSelectedSpot(updatedSpot);
      }
    }
  }, [parkingSpots, selectedSpot, setSelectedSpot]);

  const handleMapLoad = useCallback(
    (map) => {
      mapRef.current = map;

      // Centrar inmediatamente cuando el mapa se carga
      if (effectiveTargetLocation) {
        // Usar un breve retraso para asegurar que el mapa está listo
        setTimeout(() => {
          centerMapOnLocation(effectiveTargetLocation);
        }, 200);
      }

      initializeMarkers();
    },
    [initializeMarkers, effectiveTargetLocation, centerMapOnLocation],
  );

  const handleMapClick = useCallback(() => {
    setSelectedSpot(null);
    setInfoWindowOpen(false);
  }, [setSelectedSpot, setInfoWindowOpen]);

  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Efecto específico para forzar el centrado cuando cambia el mapKey
  useEffect(() => {
    if (mapRef.current && effectiveTargetLocation) {
      setTimeout(() => centerMapOnLocation(effectiveTargetLocation), 200);
    }
  }, [mapKey, effectiveTargetLocation, centerMapOnLocation]);

  if (loadError) return <div>Error loading map.</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="w-full h-full">
      <GoogleMap
        key={`google-map-${mapKey}`}
        mapContainerClassName="w-full h-full"
        center={effectiveTargetLocation || mapCenter}
        zoom={15}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        options={{
          mapId: MAP_ID,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.LEFT_BOTTOM,
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          streetViewControl: false,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
        }}
      >
        <button
          onClick={locateUser}
          className="absolute top-4 right-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105"
          aria-label="Localizar mi ubicación"
        >
          <BiTargetLock size={24} />
        </button>

        {selectedSpot && infoWindowOpen && (
          <InfoWindowF
            position={{
              lat: selectedSpot.latitude,
              lng: selectedSpot.longitude,
            }}
            onCloseClick={() => setInfoWindowOpen(false)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -40),
              maxWidth: 320,
              disableAutoPan: false
            }}
          >
            <div className="p-4 font-sans rounded-lg overflow-hidden animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">{selectedSpot.name}</h3>

              <div className="flex items-start gap-2 mb-3">
                <LuMapPin className="text-primary mt-1 flex-shrink-0" />
                <p className="text-gray-700 text-sm">{selectedSpot.address}</p>
              </div>

              <div className={`mb-3 flex items-center gap-2 px-3 py-2 rounded-lg ${
                selectedSpot.available_spaces > 0
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                <LuCar className={`${
                  selectedSpot.available_spaces > 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <p className="text-sm font-medium">
                  {selectedSpot.available_spaces > 0
                    ? `${selectedSpot.available_spaces} espacios disponibles`
                    : 'Sin espacios disponibles'}
                </p>
              </div>

              {/* Información de precio - Se muestra siempre */}
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-800">
                <LuDollarSign className="text-blue-600" />
                <p className="text-sm font-medium">
                  $60 a $100/min
                </p>
              </div>

              {selectedSpot.available_spaces > 0 ? (
                <Button
                  className="w-full bg-primary hover:bg-primary-600 text-white flex gap-2 items-center justify-center py-2.5 transition-all shadow-md hover:shadow-lg rounded-lg"
                  onClick={() => openNavigation(selectedSpot.latitude, selectedSpot.longitude)}
                >
                  <LuNavigation className="animate-pulse" />
                  <span className="font-medium">Navegar</span>
                </Button>
              ) : (
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    Este parqueadero está lleno
                  </p>
                  <p className="text-xs text-gray-500">
                    Intenta buscar otro parqueadero cercano
                  </p>
                </div>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
});

ParkingMap.propTypes = {
  selectedSpot: PropTypes.object,
  onParkingSpotSelected: PropTypes.func.isRequired,
  setSelectedSpot: PropTypes.func.isRequired,
  targetLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

ParkingMap.defaultProps = {
  selectedSpot: null,
  targetLocation: null,
};

ParkingMap.displayName = 'ParkingMap';
export default ParkingMap;
