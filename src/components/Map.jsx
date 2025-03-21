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
  memo,
  useReducer
} from 'react';
import { BiTargetLock } from 'react-icons/bi';
import { LuNavigation, LuMapPin, LuCar, LuDollarSign } from 'react-icons/lu';

import { Button } from '@/components/common';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';
import MapSkeleton from '@/components/MapSkeleton';

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
  element.style.width = '30px';
  element.style.height = '38px';
  element.style.transition = 'all 0.3s ease';

  // Crear el SVG como HTML
  element.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 40 50" style="filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.3));">
      <path fill="${iconColor}" d="M20 0C9 0 0 9 0 20c0 11 9 20 20 20s20-9 20-20S31 0 20 0m0 33.3c-7.3 0-13.3-6-13.3-13.3 0-7.3 6-13.3 13.3-13.3 7.3 0 13.3 6 13.3 13.3 0 7.3-6 13.3-13.3 13.3"/>
      <path fill="${iconColor}" d="M20 2.5c9.7 0 17.5 7.8 17.5 17.5 0 3.5-1 6.7-2.7 9.4l-3.1 5-6.3 10.4c-1.3 2.1-3.5 3.7-6.1 4.2-.9.2-1.6.2-2.4.1-3-.4-5.3-2.1-6.7-4.3l-6.3-10.4-3.1-5C.9 26.7 0 23.5 0 20 0 10.3 7.8 2.5 17.5 2.5h2.5z"/>
      <circle fill="white" cx="20" cy="20" r="8"/>
      <text x="20" y="24" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="12" fill="${iconColor}">P</text>
    </svg>
  `;

  return element;
};

// Reducer para manejar estados complejos del mapa
const mapReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_SPOT':
      return { ...state, selectedSpot: action.payload };
    default:
      return state;
  }
};

const initialState = {
  isLoading: false,
  error: null,
  selectedSpot: null
};

// Componente Marker memoizado
const Marker = memo(({ spot, onClick, isSelected }) => {
  const markerElement = useMemo(() => createMarkerElement(spot), [spot]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Parqueadero ${spot.name} - ${spot.available_spaces} espacios disponibles`}
      onClick={() => onClick(spot)}
      onKeyPress={(e) => e.key === 'Enter' && onClick(spot)}
      className={`cursor-pointer transition-transform duration-300 ${
        isSelected ? 'scale-110 z-10' : 'scale-100 z-0'
      }`}
    >
      {markerElement}
    </div>
  );
});

Marker.displayName = 'Marker';

Marker.propTypes = {
  spot: PropTypes.shape({
    name: PropTypes.string.isRequired,
    available_spaces: PropTypes.number.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired
};

const ParkingMap = forwardRef(({
  selectedSpot,
  setSelectedSpot,
  targetLocation: targetLocationProp,
  onParkingSpotSelected
}, ref) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);
  const [forceMapUpdate, setForceMapUpdate] = useState(false);
  const { parkingSpots, targetLocation: contextTargetLocation, setTargetLocation } =
    useContext(ParkingContext);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userCircleRef = useRef(null);
  const prevParkingSpotsRef = useRef(null);
  const spotMarkerMapRef = useRef(new Map());
  const mapInitializedRef = useRef(false);
  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user || {};

  // Detectar si estamos en móvil
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  // Memoizar las opciones del mapa para evitar recreaciones
  const mapOptions = useMemo(() => ({
    mapId: MAP_ID,
    zoomControlOptions: {
      position: 3,
    },
    fullscreenControl: !isMobile,
    fullscreenControlOptions: {
      position: 7,
    },
    streetViewControl: false,
    disableDefaultUI: false,
    scaleControl: true,
    scaleControlOptions: {
      position: 5,
    },
    zoomControl: !isMobile,
    mapTypeControl: false,
    gestureHandling: isMobile ? 'greedy' : 'cooperative',
  }), [isMobile]);

  // Memoizar efectiveTargetLocation para evitar recálculos innecesarios
  const effectiveTargetLocation = useMemo(() => {
    // Si hay una prop de ubicación objetivo, usarla directamente ignorando el contexto
    if (targetLocationProp) {
      return targetLocationProp;
    }
    // De lo contrario, usar el valor del contexto
    return contextTargetLocation;
  }, [targetLocationProp, contextTargetLocation]);

  // Memoizar el centro del mapa para evitar recálculos innecesarios
  const mapCenter = useMemo(() => {
    return effectiveTargetLocation || userLocation || DEFAULT_LOCATION;
  }, [effectiveTargetLocation, userLocation]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // Función mejorada para centrar el mapa con animación suave
  const centerMapOnLocation = useCallback((location) => {
    if (mapRef.current && location) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(16);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
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

    console.log('Buscando marcador para:', spot.name);

    // Si no hay marcadores, salir
    if (!Array.isArray(markersRef.current) || markersRef.current.length === 0) {
      console.warn('No hay marcadores disponibles');
      return;
    }

    let foundMarker = null;

    // Primera estrategia: buscar por ID en el mapa auxiliar
    if (spot.id && spotMarkerMapRef.current.has(spot.id)) {
      foundMarker = spotMarkerMapRef.current.get(spot.id);
      console.log('Marcador encontrado por ID:', spot.id);
    }
    // Segunda estrategia: buscar por nombre en el mapa auxiliar
    else if (spot.name && spotMarkerMapRef.current.has(spot.name)) {
      foundMarker = spotMarkerMapRef.current.get(spot.name);
      console.log('Marcador encontrado por nombre:', spot.name);
    }
    // Tercera estrategia: comparar coordenadas con todos los marcadores
    else {
      console.log('Buscando marcador por coordenadas para:', spot.name);
      // Iterar sobre todos los marcadores para encontrar el correspondiente por coordenadas
      for (const marker of markersRef.current) {
        try {
          if (!marker || !marker.position) continue;

          const markerPosition = marker.position;

          // Usar tolerancia más amplia para la comparación
          const isMatch =
            Math.abs(markerPosition.lat - spot.latitude) < COORDINATE_TOLERANCE &&
            Math.abs(markerPosition.lng - spot.longitude) < COORDINATE_TOLERANCE;

          if (isMatch) {
            foundMarker = marker;
            console.log('Marcador encontrado por coordenadas para:', spot.name);

            // Guardar el marcador en el mapa para futuras búsquedas
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
        if (!marker || !marker.content) return;

        if (marker === foundMarker) {
          // Resaltar el marcador seleccionado
          marker.content.style.transform = 'scale(1.2)';
          marker.content.style.zIndex = '10';
        } else {
          // Restaurar estilo normal
          marker.content.style.transform = 'scale(1)';
          marker.content.style.zIndex = '1';
        }
      } catch (error) {
        console.error('Error al aplicar estilo a marcador:', error);
      }
    });

    if (!foundMarker) {
      console.warn('No se encontró el marcador para:', spot.name);
    }
  }, []);

  // Función específica para centrar en parqueadero seleccionado
  const centerOnSelectedSpot = useCallback((spot) => {
    if (!spot) return;

    console.log('Centrando en parqueadero:', spot.name);
    const spotLocation = { lat: spot.latitude, lng: spot.longitude };

    // Forzar el centrado con animación
    centerMapOnLocation(spotLocation);

    // Resaltar el marcador correspondiente
    highlightMarker(spot);

    // Asegurar que el infoWindow esté abierto
    setInfoWindowOpen(true);
  }, [centerMapOnLocation, highlightMarker]);

  // Manejar clic en el mapa (cierra info window y deselecciona spot)
  const handleMapClick = useCallback(() => {
    setSelectedSpot(null);
    setInfoWindowOpen(false);
  }, [setSelectedSpot]);

  // Función para manejar directamente los clics en las tarjetas
  const handleCardClick = useCallback((spot) => {
    if (!spot) return;

    console.log('Tarjeta de parqueadero seleccionada:', spot.name);

    // Actualizar selectedSpot
    setSelectedSpot(spot);

    // Si el mapa está listo, centrar inmediatamente
    if (mapRef.current && mapInitializedRef.current) {
      centerOnSelectedSpot(spot);
    } else {
      console.warn('El mapa no está inicializado, no se puede centrar');
    }
  }, [setSelectedSpot, centerOnSelectedSpot]);

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

  // Función simplificada para crear marcadores usando Google Maps API estándar
  const initializeMarkers = useCallback(async (forceFull = false) => {
    console.log('initializeMarkers ejecutándose, forceFull =', forceFull);
    if (!mapRef.current || !isLoaded || !window.google) {
      console.error('No se puede inicializar marcadores:', {
        mapRefExiste: !!mapRef.current,
        isLoaded,
        googleExiste: !!window.google
      });
      return;
    }

    try {
      // Verificar si necesitamos recrear los marcadores completamente
      const needsFullRefresh = forceFull || !markersRef.current.length || spotsHaveChanged();
      console.log('¿Necesita actualización completa?', needsFullRefresh, 'marcadores actuales:', markersRef.current.length);

      if (!needsFullRefresh) {
        // Solo actualizar atributos de marcadores existentes
        if (markersRef.current.length === parkingSpots.length) {
          console.log('Actualizando marcadores existentes sin recrearlos');
          for (let i = 0; i < parkingSpots.length; i++) {
            const spot = parkingSpots[i];
            const marker = markersRef.current[i];

            if (marker && marker.content) {
              // Actualizar el contenido del marcador
              const newContent = createMarkerElement(spot);
              marker.content.innerHTML = newContent.innerHTML;
            }
          }
          // Actualizar la referencia a los spots actuales
          prevParkingSpotsRef.current = [...parkingSpots];
          return;
        }
      }

      console.log('Realizando actualización completa de marcadores para', parkingSpots?.length || 0, 'spots');

      // Limpiar marcadores existentes
      if (Array.isArray(markersRef.current)) {
        console.log('Limpiando', markersRef.current.length, 'marcadores existentes');
        markersRef.current.forEach((marker) => {
          if (marker) {
            marker.setMap(null);
          }
        });
      }
      markersRef.current = [];

      // Limpiar mapa auxiliar
      spotMarkerMapRef.current.clear();

      // Cargar la biblioteca de marcadores
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');

      // Verificar que parkingSpots es un array válido
      if (!Array.isArray(parkingSpots) || parkingSpots.length === 0) {
        console.error('No hay parkingSpots para mostrar:', parkingSpots);
        return;
      }

      // Crear marcadores para cada spot utilizando el AdvancedMarkerElement
      const newMarkers = [];
      console.log('Creando', parkingSpots.length, 'nuevos marcadores');

      for (const spot of parkingSpots) {
        if (!spot || typeof spot.latitude !== 'number' || typeof spot.longitude !== 'number') {
          console.warn('Spot inválido, saltando:', spot);
          continue;
        }

        console.log('Creando marcador para:', spot.name, 'en', spot.latitude, spot.longitude);

        // Crear el elemento HTML para el marcador
        const markerContent = createMarkerElement(spot);

        // Crear el marcador avanzado
        const marker = new AdvancedMarkerElement({
          position: { lat: spot.latitude, lng: spot.longitude },
          map: mapRef.current,
          title: spot.name,
          content: markerContent,
          zIndex: 1
        });

        // Agrega un listener para manejar clics en el marcador
        marker.addListener('gmp-click', () => {
          handleCardClick(spot);

          if (onParkingSpotSelected && typeof onParkingSpotSelected === 'function') {
            onParkingSpotSelected({
              spot,
              navigate: () => openNavigation(spot.latitude, spot.longitude)
            });
          }
        });

        // Guardar marcador en el array
        newMarkers.push(marker);

        // Guardar en el mapa auxiliar para búsqueda rápida
        if (spot.id) spotMarkerMapRef.current.set(spot.id, marker);
        if (spot.name) spotMarkerMapRef.current.set(spot.name, marker);
      }

      console.log('Creados', newMarkers.length, 'marcadores nuevos');
      markersRef.current = newMarkers;
      // Guardar referencia a los spots actuales para comparación futura
      prevParkingSpotsRef.current = [...parkingSpots];

      // Agregar listener al mapa para cerrar infowindow al hacer clic fuera
      if (mapRef.current) {
        if (mapRef.current.clickListener) {
          window.google.maps.event.removeListener(mapRef.current.clickListener);
        }

        mapRef.current.clickListener = window.google.maps.event.addListener(
          mapRef.current,
          'click',
          () => {
            // Resetear estado de marcadores
            if (Array.isArray(markersRef.current)) {
              markersRef.current.forEach(marker => {
                if (marker && marker.content) {
                  marker.content.style.transform = 'scale(1)';
                  marker.content.style.zIndex = '1';
                }
              });
            }

            // Cerrar infowindow
            handleMapClick();
          }
        );
      }
    } catch (error) {
      console.error('Error al inicializar marcadores:', error);
    }
  }, [parkingSpots, isLoaded, onParkingSpotSelected, handleCardClick, handleMapClick, spotsHaveChanged]);

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

  // Efecto optimizado para inicializar marcadores solo cuando sea necesario
  useEffect(() => {
    if (isLoaded && mapRef.current && mapInitializedRef.current) {
      // Inicializar solo si han cambiado los datos de manera significativa
      if (spotsHaveChanged()) {
        // Pequeño timeout para no bloquear la UI
        const timer = setTimeout(() => {
          initializeMarkers(false);
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, parkingSpots, initializeMarkers, spotsHaveChanged]);

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

  // Función para limpiar recursos al desmontar el mapa
  const onMapUnmount = useCallback(() => {
    if (mapRef.current) {
      if (mapRef.current.clickListener) {
        window.google.maps.event.removeListener(mapRef.current.clickListener);
      }
      if (userCircleRef.current) {
        userCircleRef.current.setMap(null);
      }
      markersRef.current.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      markersRef.current = [];
    }
  }, []);

  // Exponer métodos para que el componente padre pueda acceder a ellos
  useImperativeHandle(ref, () => ({
    // Exponer la función handleCardClick para que el componente padre pueda llamarla
    handleCardClick,

    // Exponer la función para centrar el mapa en un spot específico
    centerOnSpot: (spot) => {
      if (!spot) return;

      console.log('Centrando en spot mediante la referencia externa:', spot.name);

      if (mapRef.current && mapInitializedRef.current) {
        centerOnSelectedSpot(spot);
      } else {
        console.warn('El mapa no está inicializado, no se puede centrar');
      }
    },

    // Dar acceso a la referencia al mapa directamente
    getMapRef: () => mapRef.current
  }), [handleCardClick, centerOnSelectedSpot]);

  if (loadError) return <div className="w-full h-full flex items-center justify-center bg-gray-100">Error al cargar el mapa. Intente recargar la página.</div>;
  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-100">Cargando mapa...</div>;

  return (
    <div
      className="relative w-full h-full"
      role="region"
      aria-label="Mapa de parqueaderos"
      tabIndex="0"
    >
      {state.isLoading && <MapSkeleton />}

      {state.error && (
        <div
          className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <p>{state.error}</p>
        </div>
      )}

      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={mapCenter}
          zoom={16}
          options={mapOptions}
          onLoad={handleMapLoad}
          onUnmount={onMapUnmount}
          ref={mapRef}
        >
          <button
            onClick={locateUser}
            className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Ubicar mi posición"
          >
            <BiTargetLock className="w-6 h-6" />
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
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
});

ParkingMap.propTypes = {
  selectedSpot: PropTypes.object,
  onParkingSpotSelected: PropTypes.func,
  setSelectedSpot: PropTypes.func.isRequired,
  targetLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

ParkingMap.defaultProps = {
  selectedSpot: null,
  targetLocation: null,
  onParkingSpotSelected: null
};

ParkingMap.displayName = 'ParkingMap';
export default ParkingMap;
