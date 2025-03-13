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

// Mayor tolerancia para comparar coordenadas
const COORDINATE_TOLERANCE = 0.0005;

// Convertir a forwardRef para poder recibir la ref desde el componente padre
const ParkingMap = forwardRef(({
  selectedSpot,
  setSelectedSpot,
  targetLocation: targetLocationProp,
  onParkingSpotSelected
}, ref) => {
  const { parkingSpots, targetLocation: contextTargetLocation, setTargetLocation } =
    useContext(ParkingContext);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userCircleRef = useRef(null);
  const markerLibRef = useRef(null);

  // Mantener un mapa auxiliar para buscar marcadores por ID o nombre
  const spotMarkerMapRef = useRef(new Map());

  // Referencia para rastrear si el mapa está inicializado
  const mapInitializedRef = useRef(false);

  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user || {};

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

  // Función mejorada para centrar el mapa con animación suave
  const centerMapOnLocation = useCallback((location) => {
    if (mapRef.current && location) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(16);
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

  // Función mejorada para crear el contenido de los marcadores
  const createMarkerContent = useCallback((spot) => {
    try {
      const markerContent = document.createElement('div');
      markerContent.className = 'parking-marker-container';

      // Determinar color basado en disponibilidad
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
    } catch (error) {
      console.error('Error al crear el contenido del marcador:', error);
      // Crear un marcador alternativo simple como fallback
      const fallback = document.createElement('div');
      fallback.textContent = 'P';
      fallback.style.width = '30px';
      fallback.style.height = '30px';
      fallback.style.backgroundColor = spot.available_spaces > 0 ? COLOR_AVAILABLE : COLOR_NO_AVAILABLE;
      fallback.style.color = 'white';
      fallback.style.textAlign = 'center';
      fallback.style.lineHeight = '30px';
      fallback.style.fontWeight = 'bold';
      fallback.style.borderRadius = '50%';
      return fallback;
    }
  }, []);

  // Cargar la biblioteca de marcadores avanzados
  const loadMarkerLibrary = useCallback(async () => {
    if (!markerLibRef.current && window.google) {
      try {
        const lib = await window.google.maps.importLibrary('marker');
        markerLibRef.current = lib;
        return lib;
      } catch (error) {
        console.error('Error al cargar la biblioteca de marcadores:', error);
        return null;
      }
    }
    return markerLibRef.current;
  }, []);

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

  // Inicialización mejorada de marcadores
  const initializeMarkers = useCallback(async () => {
    if (!mapRef.current || !isLoaded || !window.google) return;

    try {
      console.log('Iniciando creación de marcadores...');
      // Limpiar marcadores existentes
      if (Array.isArray(markersRef.current)) {
        markersRef.current.forEach((marker) => {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        });
      }
      markersRef.current = [];

      // Limpiar mapa auxiliar
      spotMarkerMapRef.current.clear();

      // Cargar biblioteca de marcadores
      const markerLib = await loadMarkerLibrary();
      if (!markerLib || !markerLib.AdvancedMarkerElement) {
        console.error('No se pudo cargar la biblioteca de marcadores');
        return;
      }

      const { AdvancedMarkerElement } = markerLib;

      // Verificar que parkingSpots es un array válido
      if (!Array.isArray(parkingSpots) || parkingSpots.length === 0) {
        console.error('No hay parkingSpots para mostrar:', parkingSpots);
        return;
      }

      // Crear marcadores para cada spot
      const newMarkers = [];
      console.log(`Creando ${parkingSpots.length} marcadores...`);

      for (const spot of parkingSpots) {
        if (!spot || typeof spot.latitude !== 'number' || typeof spot.longitude !== 'number') {
          continue;
        }

        const marker = new AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: spot.latitude, lng: spot.longitude },
          title: spot.name,
          content: createMarkerContent(spot),
        });

        marker.addListener('gmp-click', () => {
          // Llamar al manejador de clics de tarjeta directamente
          handleCardClick(spot);

          // Notificar la selección externamente
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

      markersRef.current = newMarkers;
      console.log(`Creados ${newMarkers.length} marcadores exitosamente`);

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
  }, [parkingSpots, createMarkerContent, isLoaded, onParkingSpotSelected, loadMarkerLibrary, handleCardClick, handleMapClick]);

  // Inicializar marcadores cuando el mapa esté cargado
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      setTimeout(() => {
        initializeMarkers();
      }, 100);
    }

    return () => {
      try {
        // Limpiar marcadores
        if (Array.isArray(markersRef.current)) {
          markersRef.current.forEach((marker) => {
            if (marker && typeof marker.setMap === 'function') {
              marker.setMap(null);
            }
          });
        }

        // Eliminar listeners
        if (mapRef.current) {
          if (mapRef.current.clickListener) {
            window.google.maps.event.removeListener(mapRef.current.clickListener);
            mapRef.current.clickListener = null;
          }
        }

        // Limpiar círculo de usuario
        if (userCircleRef.current) {
          userCircleRef.current.setMap(null);
          userCircleRef.current = null;
        }
      } catch (error) {
        console.error('Error en cleanup:', error);
      }
    };
  }, [isLoaded, initializeMarkers]);

  // Actualizar spot seleccionado si cambian los datos
  useEffect(() => {
    if (selectedSpot && Array.isArray(parkingSpots)) {
      const updatedSpot = parkingSpots.find(
        (spot) => spot.id === selectedSpot.id
      );
      if (
        updatedSpot &&
        updatedSpot.available_spaces !== selectedSpot.available_spaces
      ) {
        setSelectedSpot(updatedSpot);
      }
    }
  }, [parkingSpots, selectedSpot, setSelectedSpot]);

  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Modificar el handleMapLoad para marcar cuando el mapa está realmente listo
  const handleMapLoad = useCallback(
    (map) => {
      if (!map || mapRef.current === map) return;

      console.log('Mapa cargado por primera vez');
      mapRef.current = map;

      // Inicializar marcadores después de que el mapa esté listo
      setTimeout(() => {
        initializeMarkers().then(() => {
          console.log('Marcadores inicializados correctamente');
          // Marcar el mapa como completamente inicializado
          mapInitializedRef.current = true;

          // Si ya había un spot seleccionado en este punto, centrarlo
          if (selectedSpot) {
            const spotLocation = {
              lat: selectedSpot.latitude,
              lng: selectedSpot.longitude
            };

            console.log('Centrando en spot seleccionado después de inicialización', selectedSpot.name);
            centerMapOnLocation(spotLocation);
            setInfoWindowOpen(true);
          }
          // Centrar en la ubicación objetivo si existe
          else if (effectiveTargetLocation) {
            console.log('Centrando en ubicación objetivo después de inicialización');
            centerMapOnLocation(effectiveTargetLocation);
          }
        });
      }, 300);
    },
    [initializeMarkers, effectiveTargetLocation, centerMapOnLocation, selectedSpot],
  );

  // Forzar la recarga completa del mapa cuando cambian ciertas props críticas
  useEffect(() => {
    // Si el mapa fue reiniciado (nuevo mapKey), reiniciar también el estado de inicialización
    mapInitializedRef.current = false;
  }, [mapKey]);

  // Efecto específico para forzar el centrado cuando cambia el mapKey
  useEffect(() => {
    if (mapRef.current && effectiveTargetLocation) {
      setTimeout(() => centerMapOnLocation(effectiveTargetLocation), 200);
    }
  }, [mapKey, effectiveTargetLocation, centerMapOnLocation]);

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
    <div className="w-full h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[85vh] overflow-hidden relative">
      <div className="w-full h-full md:rounded-md overflow-hidden">
        <GoogleMap
          key={`google-map-${mapKey}`}
          mapContainerClassName="w-full h-full"
          center={mapCenter}
          zoom={15}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          options={{
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
          }}
        >
          <button
            onClick={locateUser}
            className="absolute bottom-4 left-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105 z-10"
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
