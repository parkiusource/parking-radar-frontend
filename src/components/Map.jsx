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
  useImperativeHandle,
  memo
} from 'react';
import { BiTargetLock } from 'react-icons/bi';
import { Navigation, MapPin, Car, DollarSign } from 'lucide-react';

import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Mover las constantes fuera del componente para evitar recreación en cada renderizado
// https://react-google-maps-api-docs.netlify.app/#loadscript
const LIBRARIES = ['marker'];
const DEFAULT_RADIUS = 30;
const DEFAULT_LOCATION = { lat: 4.711, lng: -74.0721 };
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;
const COLOR_NO_AVAILABLE = '#8B0000';
const COLOR_AVAILABLE = '#1B5E20';

// Mayor tolerancia para comparar coordenadas
const COORDINATE_TOLERANCE = 0.0005;

// Crea un elemento HTML para el contenido del marcador personalizado
const createMarkerElement = (spot) => {
  const iconColor = spot.available_spaces > 0 ? COLOR_AVAILABLE : COLOR_NO_AVAILABLE;

  // Crear un contenedor para el marcador
  const element = document.createElement('div');
  element.style.position = 'relative';
  element.style.cursor = 'pointer';
  element.style.width = '24px';
  element.style.height = '32px';
  element.style.transition = 'transform 0.2s ease';

  // SVG simplificado para mejor rendimiento
  element.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
      <path d="M12 0C5.383 0 0 5.383 0 12c0 9 12 20 12 20s12-11 12-20c0-6.617-5.383-12-12-12z"
            fill="${iconColor}" />
      <circle cx="12" cy="12" r="8" fill="white" opacity="0.95"/>
      <text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="${iconColor}">P</text>
    </svg>
  `;

  return element;
};

// Componente InfoWindow optimizado y memoizado
const ParkingInfoWindow = memo(({ spot, onNavigate }) => {
  if (!spot) return null;

  return (
    <div className="p-3 font-sans rounded-lg overflow-hidden animate-fadeIn">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">{spot.name}</h3>
      </div>

      <div className="flex items-start gap-2 mb-2">
        <MapPin className="text-primary mt-1 flex-shrink-0 w-4 h-4" />
        <p className="text-gray-700 text-sm">{spot.address}</p>
      </div>

      <div className={`mb-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
        spot.available_spaces > 0
          ? 'bg-green-50 text-green-800'
          : 'bg-red-50 text-red-800'
      }`}>
        <Car className={`w-4 h-4 ${
          spot.available_spaces > 0 ? 'text-green-600' : 'text-red-600'
        }`} />
        <p className="text-sm">
          {spot.available_spaces > 0
            ? `${spot.available_spaces} espacios disponibles`
            : 'Sin espacios disponibles'}
        </p>
      </div>

      <div className="mb-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800">
        <DollarSign className="w-4 h-4 text-blue-600" />
        <p className="text-sm">
          $60 a $100/min
        </p>
      </div>

      {spot.available_spaces > 0 ? (
        <button
          className="w-full bg-primary hover:bg-primary-600 text-white flex gap-2 items-center justify-center py-2 px-3 transition-all shadow-md hover:shadow-lg rounded-lg text-sm"
          onClick={onNavigate}
        >
          <Navigation className="w-4 h-4 animate-pulse" />
          <span>Navegar</span>
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-sm text-gray-700 font-medium">
            Este parqueadero está lleno
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Intenta buscar otro parqueadero cercano
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.spot?.id === nextProps.spot?.id &&
         prevProps.spot?.available_spaces === nextProps.spot?.available_spaces;
});

ParkingInfoWindow.displayName = 'ParkingInfoWindow';

// Convertir a forwardRef para poder recibir la ref desde el componente padre
const ParkingMap = memo(forwardRef(({
  selectedSpot = null,
  setSelectedSpot,
  targetLocation = null,
  onParkingSpotSelected = null
}, ref) => {
  const { parkingSpots, targetLocation: contextTargetLocation, setTargetLocation } =
    useContext(ParkingContext);

  // Debug: Verificar datos de parkingSpots
  useEffect(() => {
    console.log('Map component - parkingSpots:', parkingSpots);
    if (Array.isArray(parkingSpots)) {
      console.log('  Cantidad de spots:', parkingSpots.length);
      if (parkingSpots.length > 0) {
        console.log('  Primer spot:', parkingSpots[0]);
      }
    } else {
      console.log('  parkingSpots no es un array:', parkingSpots);
    }
  }, [parkingSpots]);

  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userCircleRef = useRef(null);
  const prevParkingSpotsRef = useRef(null);

  // Mantener un mapa auxiliar para buscar marcadores por ID o nombre
  const spotMarkerMapRef = useRef(new Map());

  // Referencia para rastrear si el mapa está inicializado
  const mapInitializedRef = useRef(false);

  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user || {};

  // Reducir recargas completas usando marcador de inicialización en lugar de mapKey
  const [forceMapUpdate, setForceMapUpdate] = useState(false);

  // Memoizar efectiveTargetLocation para evitar recálculos innecesarios
  const effectiveTargetLocation = useMemo(() => {
    // Si hay una prop de ubicación objetivo, usarla directamente ignorando el contexto
    if (targetLocation) {
      return targetLocation;
    }
    // De lo contrario, usar el valor del contexto
    return contextTargetLocation;
  }, [targetLocation, contextTargetLocation]);

  // Memoizar el centro del mapa para evitar recálculos innecesarios
  const mapCenter = useMemo(() => {
    let center = DEFAULT_LOCATION;

    if (effectiveTargetLocation &&
        isFinite(parseFloat(effectiveTargetLocation.lat)) &&
        isFinite(parseFloat(effectiveTargetLocation.lng))) {
      center = {
        lat: parseFloat(effectiveTargetLocation.lat),
        lng: parseFloat(effectiveTargetLocation.lng)
      };
    } else if (userLocation &&
               isFinite(parseFloat(userLocation.lat)) &&
               isFinite(parseFloat(userLocation.lng))) {
      center = {
        lat: parseFloat(userLocation.lat),
        lng: parseFloat(userLocation.lng)
      };
    }

    return center;
  }, [effectiveTargetLocation, userLocation]);

  // Memoizar las opciones del mapa para evitar recreaciones
  const mapOptions = useMemo(() => ({
    mapId: MAP_ID,
    zoomControlOptions: {
      position: 3, // LEFT_BOTTOM
    },
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: 7, // RIGHT_BOTTOM
    },
    streetViewControl: false,
    disableDefaultUI: false,
    scaleControl: true,
    scaleControlOptions: {
      position: 5,
    },
    zoomControl: true,
    mapTypeControl: false,
    gestureHandling: 'greedy',
  }), []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // Función mejorada para centrar el mapa con animación suave
  const centerMapOnLocation = useCallback((location) => {
    if (!location || !mapRef.current) return;

    // Validar que las coordenadas sean números finitos
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);

    if (!isFinite(lat) || !isFinite(lng)) {
      console.error('Coordenadas inválidas:', location);
      return;
    }

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(16);
  }, []);

  const setUserLocation = useCallback(
    (location) => {
      if (updateUser) {
        updateUser({
          location,
        });
      }
    },
    [updateUser],
  );

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          if (setTargetLocation) setTargetLocation(null);
          const userLoc = { lat: latitude, lng: longitude };
          setUserLocation(userLoc);
          centerMapOnLocation(userLoc);
        },
        (error) => console.error('Error fetching location:', error),
        { enableHighAccuracy: false },
      );
    }
  };

  // Función mejorada para encontrar y resaltar el marcador correspondiente
  const highlightMarker = useCallback((spot) => {
    if (!spot) return;

    // Si no hay marcadores, salir
    if (!Array.isArray(markersRef.current) || markersRef.current.length === 0) return;

    let foundMarker = null;

    // Primera estrategia: buscar por ID en el mapa auxiliar
    if (spot.id && spotMarkerMapRef.current.has(spot.id)) {
      foundMarker = spotMarkerMapRef.current.get(spot.id);
    }
    // Segunda estrategia: buscar por nombre en el mapa auxiliar
    else if (spot.name && spotMarkerMapRef.current.has(spot.name)) {
      foundMarker = spotMarkerMapRef.current.get(spot.name);
    }
    // Tercera estrategia: comparar coordenadas con todos los marcadores
    else {
      for (const marker of markersRef.current) {
        try {
          if (!marker?.position) continue;

          const markerPosition = marker.position;

          // Usar tolerancia más amplia para la comparación
          const isMatch =
            Math.abs(markerPosition.lat - spot.latitude) < COORDINATE_TOLERANCE &&
            Math.abs(markerPosition.lng - spot.longitude) < COORDINATE_TOLERANCE;

          if (isMatch) {
            foundMarker = marker;
            if (spot.id) spotMarkerMapRef.current.set(spot.id, marker);
            if (spot.name) spotMarkerMapRef.current.set(spot.name, marker);
            break;
          }
        } catch (error) {
          console.error('Error al comparar marcador:', error);
        }
      }
    }

    // Aplicar estilos a todos los marcadores
    markersRef.current.forEach(marker => {
      try {
        if (!marker?.content) return;

        if (marker === foundMarker) {
          marker.content.style.transform = 'scale(1.2)';
          marker.content.style.zIndex = '10';
        } else {
          marker.content.style.transform = 'scale(1)';
          marker.content.style.zIndex = '1';
        }
      } catch (error) {
        console.error('Error al aplicar estilo a marcador:', error);
      }
    });
  }, []);

  // Función específica para centrar en parqueadero seleccionado
  const centerOnSelectedSpot = useCallback((spot) => {
    if (!spot) return;

    console.log('Centrando en parqueadero:', spot.name);

    // Validar que las coordenadas sean números finitos
    const lat = parseFloat(spot.latitude);
    const lng = parseFloat(spot.longitude);

    if (!isFinite(lat) || !isFinite(lng)) {
      console.error('Coordenadas inválidas para el spot:', spot.name);
      return;
    }

    const spotLocation = { lat, lng };
    centerMapOnLocation(spotLocation);
    highlightMarker(spot);
    setInfoWindowOpen(true);
  }, [centerMapOnLocation, highlightMarker]);

  // Manejar clic en el mapa (cierra info window y deselecciona spot)
  const handleMapClick = useCallback(() => {
    setSelectedSpot(null);
    setInfoWindowOpen(false);
  }, [setSelectedSpot]);

  // Memoizar el manejador de clics en marcadores y tarjetas
  const handleCardClick = useCallback((spot) => {
    if (!spot) return;

    setSelectedSpot(spot);
    setInfoWindowOpen(true);

    if (mapRef.current && mapInitializedRef.current) {
      centerOnSelectedSpot(spot);
    }

    if (onParkingSpotSelected) {
      onParkingSpotSelected({
        spot,
        navigate: () => openNavigation(spot.latitude, spot.longitude)
      });
    }
  }, [setSelectedSpot, centerOnSelectedSpot, onParkingSpotSelected]);

  // Manejador específico para clics en marcadores
  const handleMarkerClick = useCallback((spot) => {
    if (!spot) return;

    setSelectedSpot(spot);
    setInfoWindowOpen(true);

    if (mapRef.current && mapInitializedRef.current) {
      centerOnSelectedSpot(spot);
    }

    if (onParkingSpotSelected) {
      onParkingSpotSelected({
        spot,
        navigate: () => openNavigation(spot.latitude, spot.longitude)
      });
    }
  }, [setSelectedSpot, centerOnSelectedSpot, onParkingSpotSelected]);

  // Comparar si los parkingSpots han cambiado realmente
  const spotsHaveChanged = useCallback(() => {
    if (!prevParkingSpotsRef.current || !parkingSpots) return true;
    if (prevParkingSpotsRef.current.length !== parkingSpots.length) return true;

    // Comparación superficial de los IDs y available_spaces para determinar si actualizar
    for (let i = 0; i < parkingSpots.length; i++) {
      const prev = prevParkingSpotsRef.current[i];
      const curr = parkingSpots[i];
      if (!prev || !curr) return true;
      if (prev.id !== curr.id || prev.available_spaces !== curr.available_spaces) {
        return true;
      }
    }
    return false;
  }, [parkingSpots]);

  // Función para abrir navegación en Google Maps
  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Memoizar la función de inicialización de marcadores
  const initializeMarkers = useCallback(async (forceFull = false) => {
    if (!mapRef.current || !isLoaded || !window.google) {
      console.error('No se puede inicializar marcadores:', {
        mapRefExiste: !!mapRef.current,
        isLoaded,
        googleExiste: !!window.google
      });
      return;
    }

    try {
      const needsFullRefresh = forceFull || !markersRef.current.length || spotsHaveChanged();

      if (needsFullRefresh) {
        if (Array.isArray(markersRef.current)) {
          markersRef.current.forEach((marker) => marker?.setMap(null));
        }
        markersRef.current = [];
        spotMarkerMapRef.current.clear();
      }

      if (!Array.isArray(parkingSpots) || parkingSpots.length === 0) return;

      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
      const newMarkers = [];

      for (const spot of parkingSpots) {
        if (!spot?.latitude || !spot?.longitude) continue;

        let existingMarker = spotMarkerMapRef.current.get(spot.id);
        if (!needsFullRefresh && existingMarker) {
          existingMarker.content = createMarkerElement(spot);
          newMarkers.push(existingMarker);
          continue;
        }

        const markerContent = createMarkerElement(spot);
        try {
          const marker = new AdvancedMarkerElement({
            position: { lat: spot.latitude, lng: spot.longitude },
            map: mapRef.current,
            title: spot.name,
            content: markerContent,
            zIndex: 1
          });

          marker.addListener('gmp-click', () => {
            console.log('Marker clicked:', spot.name);
            handleMarkerClick(spot);
          });

          newMarkers.push(marker);
          spotMarkerMapRef.current.set(spot.id, marker);
        } catch (error) {
          console.error('Error al crear marcador:', error);
        }
      }

      markersRef.current = newMarkers;
      prevParkingSpotsRef.current = [...parkingSpots];

      if (selectedSpot) {
        highlightMarker(selectedSpot);
      }
    } catch (error) {
      console.error('Error en initializeMarkers:', error);
    }
  }, [parkingSpots, isLoaded, handleMarkerClick, spotsHaveChanged, selectedSpot, highlightMarker]);

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
      if (!effectiveTargetLocation && !selectedSpot) {
        centerMapOnLocation(userLocation);
      }

      // Actualizar el círculo de la ubicación del usuario
      try {
        if (userCircleRef.current) userCircleRef.current.setMap(null);
        userCircleRef.current = new window.google.maps.Circle({
          map: mapRef.current,
          center: userLocation,
          radius: DEFAULT_RADIUS,
          strokeColor: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.35,
          zIndex: 1
        });
      } catch (error) {
        console.error('Error al crear círculo de usuario:', error);
      }
    }
  }, [userLocation, centerMapOnLocation, effectiveTargetLocation, selectedSpot]);

  // Efecto para inicializar y actualizar marcadores
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const initMarkers = async () => {
      try {
        await initializeMarkers(true);
        mapInitializedRef.current = true;

        // Si hay un spot seleccionado, centrarlo
        if (selectedSpot) {
          centerOnSelectedSpot(selectedSpot);
        }
      } catch (error) {
        console.error('Error al inicializar marcadores:', error);
      }
    };

    // Inicializar marcadores con un pequeño retraso para asegurar que el mapa esté listo
    const timer = setTimeout(initMarkers, 100);
    return () => clearTimeout(timer);
  }, [isLoaded, parkingSpots, initializeMarkers, selectedSpot, centerOnSelectedSpot]);

  // Efecto para actualizar marcadores cuando cambian los spots
  useEffect(() => {
    if (!mapInitializedRef.current || !isLoaded || !mapRef.current) return;

    const updateMarkers = async () => {
      if (spotsHaveChanged()) {
        console.log('Actualizando marcadores por cambio en spots...');
        await initializeMarkers(false);
      }
    };

    const timer = setTimeout(updateMarkers, 50);
    return () => clearTimeout(timer);
  }, [parkingSpots, isLoaded, initializeMarkers, spotsHaveChanged]);

  // Modificar el handleMapLoad para optimizar la inicialización
  const handleMapLoad = useCallback(
    (map) => {
      if (!map || mapRef.current === map) return;

      console.log('Mapa cargado correctamente, inicializando...');
      mapRef.current = map;

      // Retrasar la inicialización inicial para permitir que el mapa se renderice primero
      const timer = setTimeout(() => {
        console.log('Iniciando carga de marcadores...');
        initializeMarkers(true).then(() => {
          console.log('Marcadores inicializados correctamente');
          mapInitializedRef.current = true;

          if (selectedSpot) {
            centerOnSelectedSpot(selectedSpot);
          } else if (effectiveTargetLocation) {
            centerMapOnLocation(effectiveTargetLocation);
          }
        });
      }, 200);

      return () => clearTimeout(timer);
    },
    [initializeMarkers, effectiveTargetLocation, centerMapOnLocation, selectedSpot, centerOnSelectedSpot],
  );

  // En lugar de renderizar el mapa nuevamente con un key diferente,
  // usamos un efecto que actualiza el estado y centro del mapa
  useEffect(() => {
    if (forceMapUpdate && mapRef.current && effectiveTargetLocation) {
      centerMapOnLocation(effectiveTargetLocation);
      setForceMapUpdate(false);
    }
  }, [forceMapUpdate, effectiveTargetLocation, centerMapOnLocation]);

  // Exponer métodos para que el componente padre pueda acceder a ellos
  useImperativeHandle(ref, () => ({
    // Exponer la función handleCardClick para que el componente padre pueda llamarla
    handleCardClick,

    // Exponer la función para centrar el mapa en un spot específico
    centerOnSpot: (spot, showPopup = false) => {
      if (!spot) return;

      console.log('Centrando en spot mediante la referencia externa:', spot.name, showPopup ? 'con popup' : 'sin popup');

      if (mapRef.current && mapInitializedRef.current) {
        centerOnSelectedSpot(spot);

        // Solo mostrar popup si se solicita explícitamente
        if (showPopup) {
          // Disparar el evento de selección del spot
          if (onParkingSpotSelected && typeof onParkingSpotSelected === 'function') {
            onParkingSpotSelected({
              spot,
              navigate: () => openNavigation(spot.latitude, spot.longitude)
            });
          }
        }
      } else {
        console.warn('El mapa no está inicializado, no se puede centrar');
      }
    },

    // Método específico para centrar sin mostrar popup
    centerOnSpotWithoutPopup: (spot) => {
      if (!spot) return;

      console.log('Centrando en spot sin mostrar popup:', spot.name);

      if (mapRef.current && mapInitializedRef.current) {
        // Solo centrar el mapa sin activar el popup
        centerOnSelectedSpot(spot);
      } else {
        console.warn('El mapa no está inicializado, no se puede centrar');
      }
    },

    // Dar acceso a la referencia al mapa directamente
    getMapRef: () => mapRef.current
  }), [handleCardClick, centerOnSelectedSpot, onParkingSpotSelected]);

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
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white'
        }}
        center={mapCenter}
        zoom={15}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        options={{
          ...mapOptions,
          backgroundColor: 'white'
        }}
      >
        <button
          onClick={locateUser}
          className="absolute bottom-4 left-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105 z-10"
          aria-label="Localizar mi ubicación"
        >
          <BiTargetLock size={24} />
        </button>

        {selectedSpot && infoWindowOpen && selectedSpot.latitude && selectedSpot.longitude && (
          <InfoWindowF
            position={{
              lat: selectedSpot.latitude,
              lng: selectedSpot.longitude,
            }}
            onCloseClick={() => {
              setInfoWindowOpen(false);
              setSelectedSpot(null);
            }}
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
        )}
      </GoogleMap>
    </div>
  );
}), (prevProps, nextProps) => {
  return prevProps.selectedSpot?.id === nextProps.selectedSpot?.id &&
         prevProps.targetLocation?.lat === nextProps.targetLocation?.lat &&
         prevProps.targetLocation?.lng === nextProps.targetLocation?.lng;
});

ParkingMap.propTypes = {
  selectedSpot: PropTypes.object,
  onParkingSpotSelected: PropTypes.func,
  setSelectedSpot: PropTypes.func.isRequired,
  targetLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  })
};

ParkingMap.displayName = 'ParkingMap';
export default ParkingMap;
