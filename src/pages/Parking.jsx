import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { LuCar, LuDollarSign, LuNavigation, LuSearch, LuArrowLeft, LuInfo, LuMapPin, LuX } from 'react-icons/lu';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSwipeable } from 'react-swipeable';

import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/common';
import ErrorBoundary from '@/components/ErrorBoundary';
import Map from '@/components/Map';
import { SearchBox } from '@/components/SearchBox';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';
import { useNearbyParkingSpots } from '@/hooks/useNearbySpots';
import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { useInView } from 'react-intersection-observer';

// Constantes
const DEFAULT_MAX_DISTANCE = 1000;
const DEFAULT_LIMIT = 10;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

// Hook personalizado para caché de búsqueda
const useLocationCache = () => {
  const [cache, setCache] = useState({});

  const getLocationCache = useCallback((lat, lng) => {
    const key = `${lat},${lng}`;
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [cache]);

  const setLocationCache = useCallback((lat, lng, data) => {
    const key = `${lat},${lng}`;
    setCache(prevCache => ({
      ...prevCache,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  return { getLocationCache, setLocationCache };
};

// Componente Skeleton mejorado con aria-label
const ParkingSpotSkeleton = () => (
  <div className="animate-pulse" aria-label="Cargando información del parqueadero">
    <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 w-8 h-8 rounded-full" />
          <div className="bg-gray-200 h-4 w-32 rounded" />
        </div>
        <div className="bg-gray-200 h-4 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-1 mb-4">
        <div className="bg-gray-200 h-3 w-full rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-200 h-8 rounded" />
        <div className="bg-gray-200 h-8 rounded" />
      </div>
    </div>
  </div>
);

// Componente optimizado del SearchBox con feedback táctil
const MemoizedSearchBox = React.memo(SearchBox);

// Componente ParkingSpotList optimizado con gestos táctiles y mejor accesibilidad
const ParkingSpotList = React.memo(({
  spots,
  selectedSpot,
  onSpotClick
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px'
  });

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const target = eventData.event.target.closest('[data-parking-card]');
      if (target) {
        target.classList.add('translate-x-2');
        setTimeout(() => target.classList.remove('translate-x-2'), 300);
      }
    },
    onSwipedRight: (eventData) => {
      const target = eventData.event.target.closest('[data-parking-card]');
      if (target) {
        target.classList.add('-translate-x-2');
        setTimeout(() => target.classList.remove('-translate-x-2'), 300);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (!inView) {
    return <div ref={ref}>{Array(3).fill(null).map((_, i) => <ParkingSpotSkeleton key={i} />)}</div>;
  }

  if (spots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm"
        role="alert"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <LuInfo className="h-8 w-8 text-gray-400" aria-hidden="true" />
        </div>
        <h3 className="text-gray-700 font-medium mb-2">No encontramos parqueaderos</h3>
        <p className="text-gray-600 text-sm">
          No encontramos parqueaderos en esta zona. Intenta buscar en otra ubicación.
        </p>
      </motion.div>
    );
  }

  return (
    <div ref={ref} {...handlers}>
      {spots.map((parking) => (
        <motion.div
          key={parking.id}
          data-parking-card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          layout
          className={`mb-4 p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-primary/30 hover:shadow-md transition-all transform ${
            selectedSpot?.id === parking.id ? 'border-primary border-opacity-70 ring-2 ring-primary/20' : ''
          }`}
          onClick={() => onSpotClick(parking)}
          onKeyPress={(e) => e.key === 'Enter' && onSpotClick(parking)}
          tabIndex={0}
          role="button"
          aria-pressed={selectedSpot?.id === parking.id}
          aria-label={`Parqueadero ${parking.name}, ${parking.available_spaces} espacios disponibles`}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="bg-primary/10 p-1.5 rounded-full text-primary mr-2">
                <LuCar className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-gray-800 text-base">
                {parking.name}
              </h3>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              parking.available_spaces > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {parking.available_spaces > 0 ? 'Disponible' : 'Lleno'}
            </span>
          </div>

          <div className="flex items-center text-gray-600 text-xs mb-4">
            <LuMapPin className="mr-1 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <span className="line-clamp-1">{parking.address}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-gray-700 text-sm">
              <div className="bg-blue-50 p-1.5 rounded-full text-blue-600 mr-2">
                <LuCar className="w-4 h-4" aria-hidden="true" />
              </div>
              <span>{parking.available_spaces} disponibles</span>
            </div>
            <div className="flex items-center text-gray-700 text-sm">
              <div className="bg-green-50 p-1.5 rounded-full text-green-600 mr-2">
                <LuDollarSign className="w-4 h-4" aria-hidden="true" />
              </div>
              <span>$60 a $100/min</span>
            </div>
          </div>

          {selectedSpot?.id === parking.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t border-gray-100"
            >
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Última actualización: {new Date().toLocaleTimeString()}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpotClick(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Cerrar detalles"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
});

ParkingSpotList.displayName = 'ParkingSpotList';

// Componente ConnectionIndicator optimizado
const ConnectionIndicator = React.memo(({ isConnected }) => (
  <div className="flex items-center gap-2" role="status" aria-live="polite">
    <div
      className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-emerald-500' : 'bg-amber-500'
      }`}
    />
    <span className="text-xs font-medium hidden md:block">
      {isConnected ? (
        <span className="text-emerald-600">En línea</span>
      ) : (
        <span className="text-amber-600">Fuera de línea</span>
      )}
    </span>
  </div>
));

ConnectionIndicator.displayName = 'ConnectionIndicator';

export default function Parking() {
  const { t } = useTranslation();
  const { parkingSpots, targetLocation, setTargetLocation, invalidate, refetch } =
    useContext(ParkingContext);
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showConnectionMessage, setShowConnectionMessage] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(false);

  const searchRef = useRef(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [spotNavigation, setSpotNavigation] = useState(null);
  const mapRef = useRef(null);

  const { location: userLocation } = user;
  const [initialLocation, setInitialLocation] = useState(null);

  const { getLocationCache, setLocationCache } = useLocationCache();

  // Configuración de gestos táctiles para móviles
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => setIsMobileListVisible(true),
    onSwipedDown: () => setIsMobileListVisible(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // Procesar los parámetros de URL al cargar el componente
  useEffect(() => {
    const handleLocationError = (error) => {
      console.error('Error getting location:', error);
      setIsLoadingLocation(false);
    };

    const processLocation = async (lat, lng) => {
      try {
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };

        // Intentar obtener datos del caché
        const cachedData = getLocationCache(lat, lng);

        if (cachedData) {
          setInitialLocation(cachedData.location);
          setTargetLocation(cachedData.location);
          if (cachedData.searchTerm) {
            setSearchTerm(cachedData.searchTerm);
          }
        } else {
          // Si no hay caché, proceder normalmente
          setInitialLocation(newLocation);
          setTargetLocation(newLocation);

          // Guardar en caché
          setLocationCache(lat, lng, {
            location: newLocation,
            searchTerm: searchTerm
          });
        }

        setIsLoadingLocation(false);
      } catch (error) {
        handleLocationError(error);
      }
    };

    const init = async () => {
      setIsLoadingLocation(true);
      const searchQuery = searchParams.get('search');
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const nearby = searchParams.get('nearby');

      setTargetLocation(null);
      setInitialLocation(null);

      if (searchQuery) {
        setSearchTerm(searchQuery);
      }

      if (lat && lng) {
        await processLocation(lat, lng);
        if (nearby === 'true') {
          setSearchTerm('Tu ubicación actual');
        }
      } else {
        setIsLoadingLocation(false);
      }
    };

    init();
  }, [searchParams, setTargetLocation, getLocationCache, setLocationCache, searchTerm]);

  // Memoize the WebSocket message handler to keep its reference stable
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'new-change-in-parking') {
      console.log('Received parking update, refreshing data...');
      invalidate();
      refetch();
    }
  }, [invalidate, refetch]);

  // Initialize WebSocket connection with real-time updates
  const { isConnected } = useWebSocket({
    onMessage: handleWebSocketMessage,
    // Only enable WebSocket when the component is mounted
    enabled: true
  });

  // Efecto para mostrar/ocultar el mensaje de conexión
  useEffect(() => {
    if (isConnected) {
      setShowConnectionMessage(true);
      const timer = setTimeout(() => {
        setShowConnectionMessage(false);
      }, 3000); // Ocultar después de 3 segundos
      return () => clearTimeout(timer);
    } else {
      setShowConnectionMessage(true);
    }
  }, [isConnected]);

  // Memoizar el resultado de useNearbyParkingSpots para evitar recálculos
  const { nearbySpots } = useNearbyParkingSpots({
    spots: parkingSpots,
    center: targetLocation || userLocation,
    limit: DEFAULT_LIMIT,
    maxRadius: DEFAULT_MAX_DISTANCE,
  });

  // Determinar el título según el tipo de búsqueda - Memoizado para evitar recálculos
  const getSectionTitle = useMemo(() => {
    if (isLoadingLocation) {
      return t('parking.loading', 'Buscando parqueaderos cercanos...');
    }

    if (!parkingSpots?.length) {
      return searchTerm
        ? t('parking.noResults', 'No se encontraron parqueaderos cerca de {{location}}', { location: searchTerm })
        : t('parking.noResultsDefault', 'No se encontraron parqueaderos cercanos');
    }

    return searchTerm
      ? t('parking.resultsFound', 'Parqueaderos cerca de {{location}}', { location: searchTerm })
      : t('parking.resultsFoundDefault', 'Parqueaderos cercanos');
  }, [isLoadingLocation, parkingSpots, searchTerm, t]);

  // Determinar el mensaje descriptivo - Memoizado para evitar recálculos
  const getDescriptiveMessage = useMemo(() => {
    if (!parkingSpots?.length) {
      return t('parking.tryDifferentLocation', 'Intenta con otra ubicación o amplía tu área de búsqueda');
    }

    return parkingSpots.length === 1
      ? t('parking.oneSpotFound', 'Se encontró {{count}} parqueadero en tu área', { count: 1 })
      : t('parking.multipleSpotFound', 'Se encontraron {{count}} parqueaderos en tu área', { count: parkingSpots.length });
  }, [parkingSpots, t]);

  const handleParkingSpotSelected = useCallback(({ spot, navigate }) => {
    setSelectedSpot(spot);
    setSpotNavigation(() => navigate);
  }, []);

  // Función mejorada para manejar el clic en la tarjeta de parqueadero
  const handleParkingCardClick = useCallback((parking) => {
    setSelectedSpot(parking);

    // Utilizar la referencia al mapa para centrar en el parqueadero seleccionado
    if (mapRef.current && mapRef.current.centerOnSpot) {
      mapRef.current.centerOnSpot(parking);
    }
  }, []);

  // Función para manejar la selección de lugares personalizados en la búsqueda
  const handleCustomPlaceSelected = useCallback(
    (place) => {
      // Limpiar estados previos
      setSelectedSpot(null);
      setIsLoadingLocation(true);

      // Actualizar el estado de búsqueda
      if (place.displayName) {
        setSearchTerm(place.displayName.text);
      }

      // Crear la nueva ubicación
      const newLocation = {
        lat: place.location.latitude,
        lng: place.location.longitude,
      };

      // Resetear ubicaciones anteriores primero
      setTargetLocation(null);
      setInitialLocation(null);

      // Después de un pequeño retraso, establecer la nueva ubicación
      setTimeout(() => {
        // Actualizar en ambos estados
        setInitialLocation(newLocation);
        setTargetLocation(newLocation);
        setIsLoadingLocation(false);

        // Actualizar la URL para reflejar la nueva búsqueda sin recargar la página
        const newSearchParams = new URLSearchParams();
        if (place.displayName) {
          newSearchParams.set('search', place.displayName.text);
        }
        newSearchParams.set('lat', place.location.latitude);
        newSearchParams.set('lng', place.location.longitude);

        const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }, 100);
    },
    [setTargetLocation, setInitialLocation],
  );

  return (
    <div className="flex flex-col min-h-screen relative bg-gray-50">
      <header className={getHeaderClassName({
        showShadow: true,
        className: 'z-10 backdrop-blur-md sticky top-0 bg-white/95 border-b border-gray-100/50 px-4 py-3 transition-all duration-300'
      })}>
        <Link to="/" className="flex items-center group" aria-label="Volver al inicio">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mr-3 md:hidden hover:text-primary transition-colors"
          >
            <LuArrowLeft className="text-gray-600 group-hover:text-primary transition-colors" aria-hidden="true" />
          </motion.div>
          <Logo variant="secondary" className="scale-90 md:scale-100" />
        </Link>

        <MemoizedSearchBox
          ref={searchRef}
          className="flex-1 max-w-xl mx-3"
          placeholder="Busca cerca a tu destino..."
          useSearchHook={useSearchPlaces}
          onResultSelected={handleCustomPlaceSelected}
          value={searchTerm}
          aria-label="Buscar ubicación"
        >
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
        </MemoizedSearchBox>

        <ConnectionIndicator isConnected={isConnected} />
      </header>

      <ErrorBoundary>
        <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 p-4 relative">
          {/* Show connection status messages */}
          <AnimatePresence>
            {showConnectionMessage && (
              <motion.div
                key={isConnected ? "connected" : "disconnected"}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
              >
                {isConnected ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">En línea</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-medium">Sin conexión</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLoadingLocation && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-medium">Obteniendo ubicación...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden h-full border border-gray-100/50"
          >
            <div className="h-full w-full bg-gray-100">
              <ErrorBoundary>
                <section className="w-full h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[85vh]">
                  <Map
                    ref={mapRef}
                    onParkingSpotSelected={handleParkingSpotSelected}
                    selectedSpot={selectedSpot}
                    setSelectedSpot={setSelectedSpot}
                    targetLocation={initialLocation || targetLocation}
                    className="w-full h-full"
                  />
                </section>
              </ErrorBoundary>
            </div>
          </motion.section>

          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="overflow-y-auto space-y-4"
          >
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {getSectionTitle}
              </h2>
              <p className="text-gray-600 text-sm">
                {getDescriptiveMessage}
              </p>
            </div>

            <AnimatePresence>
              <ParkingSpotList
                key="parkingSpotList"
                spots={nearbySpots}
                selectedSpot={selectedSpot}
                onSpotClick={handleParkingCardClick}
              />

              {selectedSpot && spotNavigation && (
                <motion.div
                  key="navigationButton"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50"
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      spotNavigation();
                    }}
                    className="w-full bg-primary hover:bg-primary-600 text-white transition-all flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] font-medium"
                    aria-label="Navegar al parqueadero seleccionado"
                  >
                    <LuNavigation className="w-5 h-5 animate-pulse" />
                    <span>Navegar a {selectedSpot.name}</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Versión móvil con gesto swipe */}
          <motion.div
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl z-50 border-t border-gray-100/50"
            initial={{ y: "100%" }}
            animate={{ y: isMobileListVisible ? "0%" : "85%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            {...swipeHandlers}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
            <div className="px-4 pb-safe max-h-[80vh] overflow-y-auto">
              <AnimatePresence>
                <ParkingSpotList
                  spots={nearbySpots}
                  selectedSpot={selectedSpot}
                  onSpotClick={handleParkingCardClick}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </main>
      </ErrorBoundary>

      <footer className="py-4 px-4 bg-white border-t border-gray-100/50 text-center text-sm text-gray-500">
        <div className="container mx-auto flex flex-wrap justify-center items-center gap-6">
          <div className="font-medium">© {new Date().getFullYear()} ParkiÜ</div>
          <nav className="flex items-center gap-6">
            <Link to="/about" className="hover:text-primary transition-colors">Nosotros</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Términos</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
