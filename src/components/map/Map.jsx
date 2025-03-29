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
const COLOR_NO_AVAILABLE = '#DC2626';  // Rojo para no disponibles (red-600)
const COLOR_GOOGLE_PLACES = '#6B7280';  // Gris para Google (gray-500)
const COLOR_PARKIU = '#2563EB';         // Azul para Parkiu (blue-600)

// Mayor tolerancia para comparar coordenadas
const COORDINATE_TOLERANCE = 0.0005;

// Umbral de cambio de ubicación (aproximadamente 50 metros)
const MIN_LOCATION_CHANGE = 0.0005;

// Tiempo mínimo entre búsquedas (200ms)
const MIN_SEARCH_INTERVAL = 200;

// Tiempo máximo de caché (2 minutos)
const CACHE_DURATION = 2 * 60 * 1000;

// Componente InfoWindow optimizado y memoizado
const ParkingInfoWindow = memo(({ spot, onNavigate }) => {
  if (!spot) return null;

  const isParkiu = !spot.isGooglePlace;
  const isAvailable = isParkiu
    ? spot.available_spaces > 0
    : spot.is_open;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const capitalizeTitle = (text) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div
      className="p-4 font-sans rounded-xl overflow-hidden animate-fadeIn bg-white shadow-xl border border-gray-100"
      style={{
        contain: 'layout style paint',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-gray-800 line-clamp-1">
          {capitalizeTitle(spot.name)}
        </h3>
        {isParkiu && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <img src="/icons/providers/parkiu.svg" alt="Parkiu" className="w-2.5 h-2.5 mr-0.5" />
            Parkiu
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        {!isParkiu && spot.rating > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600">{spot.rating}</span>
          </div>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {isParkiu
            ? (spot.available_spaces > 0 ? 'Disponible' : 'Lleno')
            : (spot.is_open ? 'Abierto' : 'Cerrado')
          }
        </span>
      </div>

      <div className="flex items-start gap-2 mb-3 text-gray-600">
        <MapPin className="mt-1 flex-shrink-0 w-3.5 h-3.5" />
        <p className="text-xs leading-relaxed">{spot.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {isParkiu ? (
          <>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <Car className={`w-3.5 h-3.5 ${
                isAvailable ? 'text-green-600' : 'text-red-600'
              }`} />
              <div>
                <p className="text-xs font-medium">
                  {spot.available_spaces > 0 ? `${spot.available_spaces} espacios` : 'Sin espacios'}
                </p>
                <p className="text-[10px] opacity-75">disponibles</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <div>
                <p className="text-xs font-medium">
                  {spot.price_per_hour ? `${formatPrice(spot.price_per_hour)}/hora` : 'Consultar'}
                </p>
                <p className="text-[10px] opacity-75">
                  {spot.price_per_minute ? 'por minuto' : 'precio'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
            <img src="/icons/providers/google.svg" alt="Google" className="w-3.5 h-3.5" />
            <span className="text-xs text-gray-600">Información de Google Maps</span>
          </div>
        )}
      </div>

      {isAvailable ? (
        <button
          className="w-full bg-primary hover:bg-primary-600 text-white flex gap-2 items-center justify-center py-2 px-4 transition-all duration-200 shadow-md hover:shadow-lg rounded-lg text-sm font-medium"
          onClick={onNavigate}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Navegar</span>
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-700 font-medium">
            {isParkiu
              ? 'Este parqueadero está lleno'
              : 'Este parqueadero está cerrado'
            }
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
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
  const lastClickTime = useRef(0);
  const lastSearchTime = useRef(0);
  const lastCardClickTime = useRef(0);

  // Mantener un mapa auxiliar para buscar marcadores por ID o nombre
  const spotMarkerMapRef = useRef(new Map());

  // Referencia para rastrear si el mapa está inicializado
  const mapInitializedRef = useRef(false);

  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user || {};

  // Reducir recargas completas usando marcador de inicialización en lugar de mapKey
  const [forceMapUpdate, setForceMapUpdate] = useState(false);

  // Referencia para rastrear marcadores activos
  const activeMarkersRef = useRef(new Set());

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

    if (effectiveTargetLocation?.lat && effectiveTargetLocation?.lng) {
      const lat = parseFloat(effectiveTargetLocation.lat);
      const lng = parseFloat(effectiveTargetLocation.lng);
      if (isFinite(lat) && isFinite(lng)) {
        center = { lat, lng };
      }
    } else if (userLocation?.lat && userLocation?.lng) {
      const lat = parseFloat(userLocation.lat);
      const lng = parseFloat(userLocation.lng);
      if (isFinite(lat) && isFinite(lng)) {
        center = { lat, lng };
      }
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
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
        </filter>
        <path d="M20 2C13.3726 2 8 7.37258 8 14C8 18.8492 12.8033 26.6124 19.4961 31.5568C19.8111 31.8016 20.1889 31.8016 20.5039 31.5568C27.1967 26.6124 32 18.8492 32 14C32 7.37258 26.6274 2 20 2Z"
              fill="${color}"
              filter="url(#shadow)"/>
        <circle cx="20" cy="14" r="8"
                fill="white"
                fill-opacity="0.95"/>
        <text x="20" y="17"
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
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
        </filter>
        <path d="M20 2C13.3726 2 8 7.37258 8 14C8 18.8492 12.8033 26.6124 19.4961 31.5568C19.8111 31.8016 20.1889 31.8016 20.5039 31.5568C27.1967 26.6124 32 18.8492 32 14C32 7.37258 26.6274 2 20 2Z"
              fill="${COLOR_GOOGLE_PLACES}"
              filter="url(#shadow)"/>
        <circle cx="20" cy="14" r="8"
                fill="white"
                fill-opacity="0.95"/>
        <text x="20" y="17"
              font-family="Arial, sans-serif"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              fill="${COLOR_GOOGLE_PLACES}">
          P
        </text>
      </svg>
    `;

    markerElement.innerHTML = svg;
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

    // Validar coordenadas
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
    if (!isFinite(lat) || !isFinite(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180) {
      debug('❌ Coordenadas fuera de rango válido');
      return;
    }

    // Evitar búsquedas muy frecuentes
    const now = Date.now();
    if (lastSearchTime.current && now - lastSearchTime.current < MIN_SEARCH_INTERVAL) {
      debug('⚠️ Búsqueda omitida - Demasiado frecuente', {
        tiempoTranscurrido: `${now - lastSearchTime.current}ms`,
        tiempoMinimo: `${MIN_SEARCH_INTERVAL}ms`
      });
      return;
    }
    lastSearchTime.current = now;

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
        // Verificar si el caché ha expirado
        const cacheAge = now - (lastSearchLocationRef.current.timestamp || 0);
        if (cacheAge < CACHE_DURATION) {
          // Si hay resultados en caché, usarlos
          const cachedResults = getCachedResult(location);
          if (cachedResults?.length > 0) {
            debug('✅ Usando resultados en caché', {
              edadCache: `${Math.round(cacheAge / 1000)}s`,
              resultados: cachedResults.length
            });
            const parkiuSpots = (parkingSpots || []).filter(spot => !spot.isGooglePlace);
            setParkingSpots([...parkiuSpots, ...cachedResults]);
            return;
          }
        }
      }
    }

    // Si hay una búsqueda reciente en la misma ubicación, usar caché si existe
    const cachedResults = getCachedResult(location);
    if (cachedResults) {
      const cacheAge = now - cachedResults[0]?.lastUpdated;
      debug('📦 Evaluando caché:', {
        ubicacion: {
          lat: location.lat.toFixed(6),
          lng: location.lng.toFixed(6)
        },
        resultados: cachedResults.length,
        edad: `${Math.round(cacheAge / 1000)}s`
      });

      if (cacheAge < CACHE_DURATION && cachedResults.length > 0) {
        debug('✅ Usando resultados en caché');
        const parkiuSpots = (parkingSpots || []).filter(spot => !spot.isGooglePlace);
        setParkingSpots([...parkiuSpots, ...cachedResults]);
        return;
      } else {
        debug('⚠️ Caché expirado o vacío - Actualizando datos');
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

  // Función optimizada para limpiar marcadores
  const cleanupMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      try {
        if (marker?.setMap) {
          marker.setMap(null);
          // Remover listeners si existen
          if (marker.removeListener) {
            marker.removeListener('click');
            marker.removeListener('gmp-click');
          }
        }
      } catch (error) {
        debugError('Error al limpiar marcador:', error);
      }
    });
    markersRef.current = [];
    activeMarkersRef.current.clear();
  }, []);

  // Optimizar initializeMarkers para reutilizar marcadores existentes
  const initializeMarkers = useCallback(() => {
    if (!mapRef.current || !parkingSpots?.length) return;

    // Limpiar marcadores existentes de manera segura
    cleanupMarkers();

    // Validar spots antes de crear marcadores
    const validSpots = parkingSpots.filter(spot =>
      spot?.id &&
      spot?.latitude &&
      spot?.longitude &&
      isFinite(parseFloat(spot.latitude)) &&
      isFinite(parseFloat(spot.longitude))
    );

    // Crear un mapa de los marcadores existentes usando el ID del spot
    const existingMarkers = new Map(markersRef.current.map(marker => [marker.spotId, marker]));
    const newMarkers = [];
    const updatedSpotMarkerMap = new Map();
    const processedSpotIds = new Set();

    validSpots.forEach(spot => {
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
          if (!activeMarkersRef.current.has(spot.id)) return;
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
      activeMarkersRef.current.add(spot.id);
    });

    // Limpiar marcadores no utilizados
    existingMarkers.forEach(marker => {
      marker.setMap(null);
    });

    markersRef.current = newMarkers;
    spotMarkerMapRef.current = updatedSpotMarkerMap;
  }, [parkingSpots, setSelectedSpot, createParkiuMarkerContent, createGooglePlacesMarkerContent, createMapMarker, onParkingSpotSelected, cleanupMarkers]);

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

  // Optimizar la función highlightMarker
  const highlightMarker = useCallback((spot) => {
    if (!spot?.id || !activeMarkersRef.current.has(spot.id)) return;

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
    if (!event?.domEvent?.target) return;

    // Evitar múltiples clicks rápidos
    if (event.domEvent.timeStamp - lastClickTime.current < 300) return;
    lastClickTime.current = event.domEvent.timeStamp;

    const target = event.domEvent.target;
    const isMapClick = target.closest('.gm-style') &&
                      !target.closest('.marker-content') &&
                      !target.closest('.info-window');

    if (isMapClick) {
      requestAnimationFrame(() => {
        setSelectedSpot(null);
        setInfoWindowOpen(false);
      });
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

  // Efecto para limpiar marcadores cuando cambian los spots
  useEffect(() => {
    if (!parkingSpots?.length) {
      cleanupMarkers();
    }
  }, [parkingSpots, cleanupMarkers]);

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

  // Limpieza de recursos al desmontar
  useEffect(() => {
    return () => {
      cleanupMarkers();

      // Limpiar referencias
      spotMarkerMapRef.current.clear();

      // Resetear contadores
      lastClickTime.current = 0;
      lastSearchTime.current = 0;
      lastCardClickTime.current = 0;

      // Resetear el contador de API
      apiLimiter.reset();
    };
  }, [cleanupMarkers]);

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
