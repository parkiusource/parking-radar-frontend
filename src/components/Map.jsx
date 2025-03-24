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
import { apiLimiter } from '@/services/apiLimiter';
import { useSearchState } from '@/hooks/useSearchState';

import { ParkingContext } from '@/context/parkingContextUtils';
import { UserContext } from '@/context/userContextDefinition';
import { GEOLOCATION_CONFIG } from '@/services/geolocationService';

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

const debugWarn = (message, data) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// https://react-google-maps-api-docs.netlify.app/#loadscript
const LIBRARIES = ['places', 'marker', 'geometry'];
const DEFAULT_LOCATION = { lat: 4.711, lng: -74.0721 };
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;
const COLOR_NO_AVAILABLE = '#8B0000';
const COLOR_GOOGLE_PLACES = '#4285F4';  // Color azul de Google
const COLOR_PARKIU = '#34D399';         // Color verde de Parkiu

// Mayor tolerancia para comparar coordenadas
const COORDINATE_TOLERANCE = 0.0005;

// Umbral de cambio de ubicación (aproximadamente 100 metros)
const MIN_LOCATION_CHANGE = 0.001;


// Componente InfoWindow optimizado y memoizado
const ParkingInfoWindow = memo(({ spot, onNavigate }) => {
  if (!spot) return null;

  const isAvailable = spot.available_spaces > 0 && spot.is_open;

  return (
    <div
      className="p-4 font-sans rounded-xl overflow-hidden animate-fadeIn bg-white shadow-xl border border-gray-100"
      style={{
        contain: 'layout style paint',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">{spot.name}</h3>
        <div className="flex items-center gap-2">
          {spot.rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm text-gray-600">{spot.rating}</span>
            </div>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {!spot.is_open ? 'Cerrado' : (spot.available_spaces > 0 ? 'Disponible' : 'Lleno')}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2 mb-3">
        <MapPin className="text-primary mt-1 flex-shrink-0 w-4 h-4" />
        <p className="text-gray-600 text-sm leading-relaxed">{spot.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <Car className={`w-4 h-4 ${
            isAvailable ? 'text-green-600' : 'text-red-600'
          }`} />
          <div>
            <p className="text-sm font-medium">
              {spot.is_open ? (spot.available_spaces > 0 ? `${spot.available_spaces} espacios` : 'Sin espacios') : 'Cerrado'}
            </p>
            <p className="text-xs opacity-75">
              {spot.is_open ? 'disponibles' : 'temporalmente'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium">$60 - $100</p>
            <p className="text-xs opacity-75">por minuto</p>
          </div>
        </div>
      </div>

      {isAvailable ? (
        <button
          className="w-full bg-primary hover:bg-primary-600 text-white flex gap-2 items-center justify-center py-2.5 px-4 transition-all duration-200 shadow-md hover:shadow-lg rounded-lg text-sm font-medium"
          onClick={onNavigate}
        >
          <Navigation className="w-4 h-4 animate-pulse" />
          <span>Navegar</span>
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-700 font-medium">
            {!spot.is_open ? 'Este parqueadero está cerrado' : 'Este parqueadero está lleno'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Intenta buscar otro parqueadero cercano
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación más profunda de las propiedades relevantes
  const prevSpot = prevProps.spot;
  const nextSpot = nextProps.spot;

  if (!prevSpot || !nextSpot) return prevSpot === nextSpot;

  return (
    prevSpot.id === nextSpot.id &&
    prevSpot.name === nextSpot.name &&
    prevSpot.address === nextSpot.address &&
    prevSpot.available_spaces === nextSpot.available_spaces &&
    prevSpot.latitude === nextSpot.latitude &&
    prevSpot.longitude === nextSpot.longitude &&
    prevProps.onNavigate === nextProps.onNavigate
  );
});

ParkingInfoWindow.displayName = 'ParkingInfoWindow';

// Convertir a forwardRef para poder recibir la ref desde el componente padre
const ParkingMap = memo(forwardRef(({
  selectedSpot = null,
  setSelectedSpot,
  targetLocation = null,
  onParkingSpotSelected = null
}, ref) => {
  const { parkingSpots, targetLocation: contextTargetLocation, setTargetLocation, setParkingSpots } =
    useContext(ParkingContext);

  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const prevParkingSpotsRef = useRef(null);
  const { getCachedResult, setCachedResult, lastSearchLocationRef } = useSearchState();

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
    clickableIcons: false,
    optimized: true,
    maxZoom: 20,
    minZoom: 3,
    gestureHandling: 'greedy'
  }), []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
    language: 'es',
    region: 'CO'
  });

  // Referencia al servicio de Places
  const placesServiceRef = useRef(null);

  // Función para inicializar el servicio de Places
  const initPlacesService = useCallback(() => {
    if (!mapRef.current || !window.google?.maps?.places) {
      return false;
    }

    try {
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(mapRef.current);
      }
      return true;
    } catch (error) {
      debugError('Error al inicializar Places Service:', error);
      return false;
    }
  }, []);

  // Función mejorada para centrar el mapa con animación suave
  const centerMapOnLocation = useCallback((location) => {
    if (!location || !mapRef.current) return;

    // Validar que las coordenadas sean números finitos
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);

    if (!isFinite(lat) || !isFinite(lng)) {
      debugError('Coordenadas inválidas:', location);
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

  // Función para crear el contenido del marcador de Parkiu
  const createParkiuMarkerContent = useCallback((spot) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker parkiu-marker';
    markerElement.style.cssText = `
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      touch-action: none;
      will-change: transform;
      contain: layout style paint;
    `;

    const color = spot.available_spaces > 0 ? COLOR_PARKIU : COLOR_NO_AVAILABLE;
    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C12.0589 0 5.5 6.5589 5.5 14.5C5.5 20.0649 11.0557 28.5731 18.7882 33.7154C19.5127 34.2728 20.4873 34.2728 21.2118 33.7154C28.9443 28.5731 34.5 20.0649 34.5 14.5C34.5 6.5589 27.9411 0 20 0Z"
              fill="${color}"/>
        <circle cx="20" cy="14.5" r="10"
                fill="white"
                fill-opacity="0.9"/>
        <text x="20" y="18"
              font-family="Arial, sans-serif"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              fill="${color}">
          ${spot.available_spaces}
        </text>
      </svg>
    `;

    markerElement.innerHTML = svg;

    // Optimizar eventos táctiles y de mouse usando el evento pointerdown
    const handlePointerEvent = (e) => {
      e.stopPropagation();
      const scale = e.type === 'pointerdown' ? 1.1 : 1;
      requestAnimationFrame(() => {
        markerElement.style.transform = `scale(${scale}) translateY(${scale > 1 ? -2 : 0}px)`;
        markerElement.style.filter = `drop-shadow(0 ${scale > 1 ? 4 : 2}px ${scale > 1 ? 6 : 4}px rgba(0, 0, 0, ${scale > 1 ? 0.3 : 0.2}))`;
      });
    };

    markerElement.addEventListener('pointerdown', handlePointerEvent, { passive: true });
    markerElement.addEventListener('pointerup', handlePointerEvent, { passive: true });
    markerElement.addEventListener('pointerout', handlePointerEvent, { passive: true });

    return markerElement;
  }, []);

  // Función para crear el contenido del marcador de Google Places
  const createGooglePlacesMarkerContent = useCallback(() => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker google-places-marker';
    markerElement.style.cssText = `
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      touch-action: none;
      will-change: transform;
      contain: layout style paint;
    `;

    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C12.0589 0 5.5 6.5589 5.5 14.5C5.5 20.0649 11.0557 28.5731 18.7882 33.7154C19.5127 34.2728 20.4873 34.2728 21.2118 33.7154C28.9443 28.5731 34.5 20.0649 34.5 14.5C34.5 6.5589 27.9411 0 20 0Z"
              fill="${COLOR_GOOGLE_PLACES}"/>
        <circle cx="20" cy="14.5" r="10"
                fill="white"
                fill-opacity="0.9"/>
        <text x="20" y="18"
              font-family="Arial, sans-serif"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              fill="${COLOR_GOOGLE_PLACES}">
          G
        </text>
      </svg>
    `;

    markerElement.innerHTML = svg;

    // Usar los mismos eventos pointer optimizados
    const handlePointerEvent = (e) => {
      e.stopPropagation();
      const scale = e.type === 'pointerdown' ? 1.1 : 1;
      requestAnimationFrame(() => {
        markerElement.style.transform = `scale(${scale}) translateY(${scale > 1 ? -2 : 0}px)`;
        markerElement.style.filter = `drop-shadow(0 ${scale > 1 ? 4 : 2}px ${scale > 1 ? 6 : 4}px rgba(0, 0, 0, ${scale > 1 ? 0.3 : 0.2}))`;
      });
    };

    markerElement.addEventListener('pointerdown', handlePointerEvent, { passive: true });
    markerElement.addEventListener('pointerup', handlePointerEvent, { passive: true });
    markerElement.addEventListener('pointerout', handlePointerEvent, { passive: true });

    return markerElement;
  }, []);

  // Función para crear un marcador (con fallback a marcador estándar si es necesario)
  const createMapMarker = useCallback((options) => {
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      return new window.google.maps.marker.AdvancedMarkerElement({
        ...options,
        // Configuración básica para mejor rendimiento
        collisionBehavior: 'OPTIONAL_AND_HIDES_LOWER_PRIORITY'
      });
    } else {
      debug('⚠️ AdvancedMarkerElement no disponible, usando Marker estándar');
      if (options.content) {
        const svgContent = options.content.innerHTML;
        options.icon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        };
        delete options.content;
      }
      return new window.google.maps.Marker({
        ...options,
        optimized: true,
        clickable: true
      });
    }
  }, []);

  // Remover funciones redundantes y optimizar las existentes
  const areLocationsSignificantlyDifferent = useCallback((loc1, loc2, threshold = MIN_LOCATION_CHANGE) => {
    if (!loc1 || !loc2) return true;

    // Validar que las coordenadas sean números válidos
    const lat1 = parseFloat(loc1.lat);
    const lng1 = parseFloat(loc1.lng);
    const lat2 = parseFloat(loc2.lat);
    const lng2 = parseFloat(loc2.lng);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return true;

    // Calcular la diferencia en grados
    const latDiff = Math.abs(lat1 - lat2);
    const lngDiff = Math.abs(lng1 - lng2);

    // Si la diferencia es mayor al umbral, considerar que son ubicaciones diferentes
    return latDiff > threshold || lngDiff > threshold;
  }, []);

  // Optimizar searchNearbyParking para usar el limitador y el caché
  const searchNearbyParking = useCallback((location) => {
    if (!location?.lat || !location?.lng || !mapRef.current || !setParkingSpots) {
      debug('❌ Búsqueda cancelada - Parámetros inválidos');
      return;
    }

    // Verificar si la ubicación está dentro de los límites razonables
    if (Math.abs(location.lat) > 90 || Math.abs(location.lng) > 180) {
      debug('❌ Búsqueda cancelada - Coordenadas fuera de rango');
      return;
    }

    debug('🔍 Iniciando búsqueda para ubicación:', {
      lat: location.lat.toFixed(6),
      lng: location.lng.toFixed(6)
    });

    // Verificar límites de la API
    if (!apiLimiter.canMakeCall()) {
      debugWarn('⚠️ Búsqueda omitida - Límite de API alcanzado');
      return;
    }

    // Verificar si la ubicación ha cambiado significativamente
    if (lastSearchLocationRef.current) {
      const isSameLocation = !areLocationsSignificantlyDifferent(
        lastSearchLocationRef.current,
        location,
        MIN_LOCATION_CHANGE
      );

      if (isSameLocation) {
        debug('🔄 Búsqueda omitida - Cambio de ubicación insignificante', {
          actual: {
            lat: location.lat.toFixed(6),
            lng: location.lng.toFixed(6)
          },
          anterior: {
            lat: lastSearchLocationRef.current.lat.toFixed(6),
            lng: lastSearchLocationRef.current.lng.toFixed(6)
          }
        });
        return;
      }
    }

    // Si hay una búsqueda reciente en la misma ubicación, usar caché si existe
    const cachedResults = getCachedResult(location);
    if (cachedResults) {
      const cacheAge = Date.now() - cachedResults[0]?.lastUpdated;
      debug('📦 Evaluando caché:', {
        ubicacion: {
          lat: location.lat.toFixed(6),
          lng: location.lng.toFixed(6)
        },
        resultados: cachedResults.length,
        edad: `${Math.round(cacheAge / 1000)}s`
      });

      if (cacheAge < 5 * 60 * 1000) {
        debug('✅ Usando resultados en caché');
        const parkiuSpots = (parkingSpots || []).filter(spot => !spot.isGooglePlace);
        setParkingSpots([...parkiuSpots, ...cachedResults]);
        return;
      } else {
        debug('⚠️ Caché expirado - Actualizando datos');
      }
    }

    debug('🌐 Consultando API de Google Places');

    // Registrar la llamada a la API y proceder con la búsqueda
    apiLimiter.logCall(location);

    // Mantener una referencia a los spots de Parkiu
    const parkiuSpots = (parkingSpots || []).filter(spot => !spot.isGooglePlace);

    // Usar AbortController para cancelar peticiones pendientes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.currentOpeningHours.openNow',
          'places.businessStatus'
        ].join(',')
      },
      body: JSON.stringify({
        includedTypes: ['parking'],
        maxResultCount: 20,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(location.lat),
              longitude: parseFloat(location.lng)
            },
            radius: 1000.0
          }
        }
      }),
      signal: controller.signal
    })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data.places) {
        debug('❌ No se encontraron lugares en la respuesta');
        return;
      }

      debug('✅ Respuesta de API recibida:', {
        totalLugares: data.places.length
      });

      const googlePlacesSpots = data.places.map(place => ({
        id: `google_${place.id}_${Date.now()}`,
        googlePlaceId: place.id,
        name: place.displayName?.text || 'Parqueadero',
        address: place.formattedAddress,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        isGooglePlace: true,
        available_spaces: 1,
        total_spaces: 1,
        min_price: 0,
        max_price: 0,
        price_per_hour: 0,
        is_open: place.currentOpeningHours?.openNow ?? true,
        rating: place.rating || 0,
        businessStatus: place.businessStatus || 'OPERATIONAL',
        lastUpdated: Date.now()
      }));

      // Calcular distancias
      if (window.google?.maps?.geometry?.spherical) {
        const origin = new window.google.maps.LatLng(location.lat, location.lng);
        googlePlacesSpots.forEach(spot => {
          const destination = new window.google.maps.LatLng(spot.latitude, spot.longitude);
          const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
          spot.distance = distanceInMeters / 1000;
          spot.formattedDistance = spot.distance < 1
            ? `${Math.round(distanceInMeters)}m`
            : `${spot.distance.toFixed(1)}km`;
        });
      }

      // Filtrar spots duplicados basados en coordenadas
      const uniqueGoogleSpots = googlePlacesSpots.filter(newSpot => {
        return !parkiuSpots.some(existingSpot =>
          Math.abs(existingSpot.latitude - newSpot.latitude) < COORDINATE_TOLERANCE &&
          Math.abs(existingSpot.longitude - newSpot.longitude) < COORDINATE_TOLERANCE
        );
      });

      debug('🔄 Procesamiento completado:', {
        totalEncontrados: googlePlacesSpots.length,
        uniqueSpots: uniqueGoogleSpots.length,
        duplicadosEliminados: googlePlacesSpots.length - uniqueGoogleSpots.length
      });

      if (uniqueGoogleSpots.length > 0) {
        debug('💾 Guardando en caché:', {
          ubicacion: {
            lat: location.lat.toFixed(6),
            lng: location.lng.toFixed(6)
          },
          cantidadSpots: uniqueGoogleSpots.length,
          timestamp: new Date().toISOString()
        });
        setCachedResult(location, uniqueGoogleSpots);
        lastSearchLocationRef.current = location;
      } else {
        debug('⚠️ No se guardó en caché - No hay spots únicos');
      }

      setParkingSpots([...parkiuSpots, ...uniqueGoogleSpots]);
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        debug('❌ Búsqueda cancelada - Timeout');
      } else {
        debugError('❌ Error en búsqueda de Google Places:', error);
      }
      clearTimeout(timeoutId);
    });
  }, [parkingSpots, setParkingSpots, getCachedResult, setCachedResult, lastSearchLocationRef, areLocationsSignificantlyDifferent]);

  // Optimizar initializeMarkers para reutilizar marcadores existentes
  const initializeMarkers = useCallback(() => {
    if (!mapRef.current || !parkingSpots?.length) return;

    // Crear un mapa de los marcadores existentes usando el ID del spot
    const existingMarkers = new Map(markersRef.current.map(marker => [marker.spotId, marker]));
    const newMarkers = [];
    const updatedSpotMarkerMap = new Map();
    const processedSpotIds = new Set();

    parkingSpots.forEach(spot => {
      if (!spot.latitude || !spot.longitude || processedSpotIds.has(spot.id)) return;

      processedSpotIds.add(spot.id);

      const existingMarker = existingMarkers.get(spot.id);
      let marker;

      if (existingMarker) {
        // Reutilizar el marcador existente
        marker = existingMarker;
        existingMarkers.delete(spot.id);
      } else {
        // Crear un nuevo marcador
        marker = createMapMarker({
          map: mapRef.current,
          position: {
            lat: parseFloat(spot.latitude),
            lng: parseFloat(spot.longitude)
          },
          title: spot.name,
          content: spot.isGooglePlace ? createGooglePlacesMarkerContent() : createParkiuMarkerContent(spot)
        });

        marker.isGooglePlace = spot.isGooglePlace;
        marker.spotId = spot.id;

        const clickEvent = window.google?.maps?.marker?.AdvancedMarkerElement ? 'gmp-click' : 'click';
        marker.addListener(clickEvent, () => {
          setSelectedSpot(spot);
          setInfoWindowOpen(true);
          if (onParkingSpotSelected) {
            onParkingSpotSelected({
              spot,
              navigate: () => openNavigation(spot.latitude, spot.longitude)
            });
          }
        });
      }

      newMarkers.push(marker);
      updatedSpotMarkerMap.set(spot.id, marker);
    });

    // Limpiar marcadores no utilizados
    existingMarkers.forEach(marker => {
      marker.setMap(null);
    });

    markersRef.current = newMarkers;
    spotMarkerMapRef.current = updatedSpotMarkerMap;
  }, [parkingSpots, setSelectedSpot, createParkiuMarkerContent, createGooglePlacesMarkerContent, createMapMarker, onParkingSpotSelected]);

  // Memoizar la función locateUser
  const locateUser = useCallback(() => {
    debug('🎯 Iniciando localización del usuario...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          debug('📍 Ubicación obtenida:', { latitude, longitude });

          const userLoc = { lat: latitude, lng: longitude };
          if (setTargetLocation) setTargetLocation(null);
          setUserLocation(userLoc);
          centerMapOnLocation(userLoc);

          setTimeout(() => {
            searchNearbyParking(userLoc);
          }, 1000);
        },
        (error) => {
          debugError('❌ Error obteniendo ubicación:', error);
        },
        GEOLOCATION_CONFIG
      );
    } else {
      debugError('❌ Geolocalización no soportada');
    }
  }, [setTargetLocation, setUserLocation, centerMapOnLocation, searchNearbyParking]);

  // Función mejorada para encontrar y resaltar el marcador correspondiente
  const highlightMarker = useCallback((spot) => {
    if (!spot) return;

    if (!Array.isArray(markersRef.current) || markersRef.current.length === 0) return;

    let foundMarker = null;

    if (spot.id && spotMarkerMapRef.current.has(spot.id)) {
      foundMarker = spotMarkerMapRef.current.get(spot.id);
    } else if (spot.name && spotMarkerMapRef.current.has(spot.name)) {
      foundMarker = spotMarkerMapRef.current.get(spot.name);
    } else {
      for (const marker of markersRef.current) {
        try {
          if (!marker?.position) continue;

          const markerPosition = marker.position;
          const markerLat = markerPosition.lat;
          const markerLng = markerPosition.lng;

          const isMatch =
            Math.abs(markerLat - spot.latitude) < COORDINATE_TOLERANCE &&
            Math.abs(markerLng - spot.longitude) < COORDINATE_TOLERANCE;

          if (isMatch) {
            foundMarker = marker;
            if (spot.id) spotMarkerMapRef.current.set(spot.id, marker);
            if (spot.name) spotMarkerMapRef.current.set(spot.name, marker);
            break;
          }
        } catch (error) {
          debugError('Error al comparar marcador:', error);
        }
      }
    }

    // Aplicar estilos a todos los marcadores
    markersRef.current.forEach(marker => {
      try {
        if (!marker) return;

        const markerElement = marker.content;
        if (marker === foundMarker) {
          markerElement.style.transform = 'scale(1.5)';
          markerElement.style.zIndex = '10';
        } else {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.zIndex = '1';
        }
      } catch (error) {
        debugError('Error al aplicar estilo a marcador:', error);
      }
    });
  }, []);

  // Función específica para centrar en parqueadero seleccionado
  const centerOnSelectedSpot = useCallback((spot, options = {}) => {
    if (!spot) return;

    const { skipHighlight = false, skipInfoWindow = false } = options;

    // Validar que las coordenadas sean números finitos
    const lat = parseFloat(spot.latitude);
    const lng = parseFloat(spot.longitude);

    if (!isFinite(lat) || !isFinite(lng)) return;

    const spotLocation = { lat, lng };
    centerMapOnLocation(spotLocation);

    if (!skipHighlight) {
      highlightMarker(spot);
    }

    if (!skipInfoWindow) {
      setInfoWindowOpen(true);
    }
  }, [centerMapOnLocation, highlightMarker]);

  // Manejar clic en el mapa (cierra info window y deselecciona spot)
  const handleMapClick = useCallback((event) => {
    // Verificar si el clic fue en un elemento del mapa
    const target = event?.domEvent?.target;
    if (!target) return;

    // Verificar si el clic fue en el mapa base o en un marcador
    const isMapClick = target.closest('.gm-style') && !target.closest('.marker-content');

    if (isMapClick) {
      setSelectedSpot(null);
      setInfoWindowOpen(false);
    }
  }, [setSelectedSpot]);

  // Memoizar el manejador de clics en marcadores y tarjetas
  const handleParkingCardClick = useCallback((parking) => {
    setSelectedSpot(prev => prev?.id === parking?.id ? null : parking);
    requestAnimationFrame(() => {
      mapRef.current?.centerOnSpot(parking);
    });
  }, [setSelectedSpot]);

  // Comparar si los parkingSpots han cambiado realmente
  const spotsHaveChanged = useCallback((prevSpots, currentSpots) => {
    if (!prevSpots || !currentSpots) return true;
    if (prevSpots.length !== currentSpots.length) return true;

    // Comparación superficial de los IDs y available_spaces para determinar si actualizar
    for (let i = 0; i < currentSpots.length; i++) {
      const prev = prevSpots[i];
      const curr = currentSpots[i];
      if (!prev || !curr) return true;
      if (prev.id !== curr.id || prev.available_spaces !== curr.available_spaces) {
        return true;
      }
    }
    return false;
  }, []);

  // Función para abrir navegación en Google Maps
  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Función para manejar la carga inicial del mapa
  const handleMapLoad = useCallback((map) => {
    if (!map || mapRef.current === map) return;

    mapRef.current = map;
    mapInitializedRef.current = true;

    // Inicializar el servicio de Places
    initPlacesService();

    // Inicializar marcadores después de que el mapa esté listo
    const timer = setTimeout(() => {
      initializeMarkers();

      if (selectedSpot) {
        centerOnSelectedSpot(selectedSpot);
      } else if (effectiveTargetLocation) {
        centerMapOnLocation(effectiveTargetLocation);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeMarkers, selectedSpot, effectiveTargetLocation, centerMapOnLocation, centerOnSelectedSpot, initPlacesService]);

  // Optimizar efectos
  useEffect(() => {
    if (!mapInitializedRef.current || !isLoaded || !mapRef.current) return;

    const timer = setTimeout(() => {
      if (spotsHaveChanged(prevParkingSpotsRef.current, parkingSpots)) {
        prevParkingSpotsRef.current = parkingSpots;
        initializeMarkers();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [parkingSpots, isLoaded, initializeMarkers, spotsHaveChanged]);

  // Efecto para manejar cambios en la ubicación objetivo
  useEffect(() => {
    if (!effectiveTargetLocation || !mapRef.current) return;

    if (lastSearchLocationRef.current) {
      const isSameLocation = !areLocationsSignificantlyDifferent(
        lastSearchLocationRef.current,
        effectiveTargetLocation,
        MIN_LOCATION_CHANGE
      );

      if (isSameLocation) {
        debug('🎯 Centrando mapa en ubicación existente');
        centerMapOnLocation(effectiveTargetLocation);
        return;
      }
    }

    debug('🔄 Nueva ubicación detectada, iniciando búsqueda...');

    lastSearchLocationRef.current = {
      ...effectiveTargetLocation,
      timestamp: Date.now()
    };

    centerMapOnLocation(effectiveTargetLocation);

    const searchTimeout = setTimeout(() => {
      searchNearbyParking(effectiveTargetLocation);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [effectiveTargetLocation, centerMapOnLocation, searchNearbyParking, lastSearchLocationRef, areLocationsSignificantlyDifferent]);

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
    handleCardClick: handleParkingCardClick,

    centerOnSpot: (spot, showPopup = false) => {
      if (!spot || !mapRef.current || !mapInitializedRef.current) return;

      if (showPopup) {
        handleParkingCardClick(spot);
      } else {
        centerOnSelectedSpot(spot, { skipInfoWindow: true });
      }
    },

    centerOnSpotWithoutPopup: (spot) => {
      if (!spot || !mapRef.current || !mapInitializedRef.current) return;
      centerOnSelectedSpot(spot, { skipInfoWindow: true, skipHighlight: true });
    },

    getMapRef: () => mapRef.current,

    searchNearbyParking: (location) => {
      if (!location || !mapRef.current || !mapInitializedRef.current) return;
      searchNearbyParking(location);
    }
  }), [handleParkingCardClick, centerOnSelectedSpot, searchNearbyParking]);

  // Optimizar el componente GoogleMap con opciones de eventos pasivos
  const googleMapProps = useMemo(() => ({
    mapContainerStyle: {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      contain: 'layout style paint',
      touchAction: 'none',
      WebkitOverflowScrolling: 'touch',
      userSelect: 'none'
    },
    center: mapCenter,
    zoom: 15,
    onLoad: handleMapLoad,
    onClick: handleMapClick,
    options: {
      ...mapOptions,
      gestureHandling: 'cooperative',
      gestureHandlingOptions: {
        passiveEvents: true,
        cooperativeTouchGestures: true,
        touchHandlingOptions: {
          passive: true,
          preventDefaultOnPanGesture: true
        }
      },
      scrollwheel: true,
      ctrlKey: true,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM || 7
      },
      disableDoubleClickZoom: true,
      minZoom: 12,
      maxZoom: 20,
      restriction: {
        latLngBounds: {
          north: 85,
          south: -85,
          west: -180,
          east: 180
        },
        strictBounds: true
      }
    }
  }), [mapCenter, handleMapLoad, handleMapClick, mapOptions]);

  // Optimizar el botón de localización
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

  // Manejador de eventos para la rueda del mouse
  const handleWheel = useCallback((e) => {
    // Solo permitir zoom si Ctrl o Cmd está presionado
    if (!(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      return false;
    }
  }, []);

  // Efecto para agregar y remover el event listener
  useEffect(() => {
    const mapContainer = document.querySelector('.google-map');
    if (mapContainer) {
      mapContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        mapContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Resetear el contador cuando el componente se desmonta
  useEffect(() => {
    return () => {
      apiLimiter.reset();
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
    <div
      className="relative h-full w-full flex flex-col"
      style={{
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <div
        className="flex-1 relative w-full h-full google-map"
        style={{
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {isLoaded ? (
          <GoogleMap {...googleMapProps}>
            {locateUserButton}
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
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="text-gray-600">
              {loadError ? 'Error al cargar el mapa' : 'Cargando mapa...'}
            </div>
          </div>
        )}
      </div>
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
