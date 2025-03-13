import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useContext, useState, useEffect, useRef } from 'react';
import { LuCar, LuDollarSign, LuNavigation, LuSearch, LuArrowLeft, LuInfo, LuMapPin } from 'react-icons/lu';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import { Button } from '@/components/common';
import Map from '@/components/Map';
import { SearchBox } from '@/components/SearchBox';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';
import { useNearbyParkingSpots } from '@/hooks/useNearbySpots';
import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';

const DEFAULT_MAX_DISTANCE = 1000;
const DEFAULT_LIMIT = 10;

// Componente optimizado del SearchBox para evitar re-renderizados innecesarios
const MemoizedSearchBox = React.memo(SearchBox);

export default function Parking() {
  const { t } = useTranslation();
  const { parkingSpots, targetLocation, setTargetLocation } =
    useContext(ParkingContext);
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const searchRef = useRef(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [spotNavigation, setSpotNavigation] = useState(null);

  // Añadir una referencia al componente Map para poder acceder a sus métodos
  const mapRef = useRef(null);

  const { location: userLocation } = user;

  // Mantener una referencia local de la ubicación inicial para asegurar que se pase correctamente al mapa
  const [initialLocation, setInitialLocation] = useState(null);

  // Procesar los parámetros de URL al cargar el componente
  useEffect(() => {
    setIsLoadingLocation(true);
    const searchQuery = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const nearby = searchParams.get('nearby');

    // Resetear targetLocation para evitar que persista la ubicación anterior
    setTargetLocation(null);
    setInitialLocation(null);

    if (searchQuery) {
      // Si hay un término de búsqueda, lo establecemos en el estado
      setSearchTerm(searchQuery);
    }

    // Procesar las coordenadas después de un pequeño retraso para asegurar que el estado previo se haya limpiado
    setTimeout(() => {
      if (lat && lng) {
        // Si hay coordenadas, actualizar targetLocation directamente
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const newLocation = { lat: latitude, lng: longitude };

          // Guardar en estado local y en contexto
          setInitialLocation(newLocation);
          setTargetLocation(newLocation);

          if (nearby === 'true') {
            setSearchTerm('Tu ubicación actual');
          }
          setIsLoadingLocation(false);
        }
      } else {
        setIsLoadingLocation(false);
      }
    }, 100);
  }, [searchParams, setTargetLocation]);

  const { nearbySpots } = useNearbyParkingSpots({
    spots: parkingSpots,
    center: targetLocation || userLocation,
    limit: DEFAULT_LIMIT,
    maxRadius: DEFAULT_MAX_DISTANCE,
  });

  // Determinar el título según el tipo de búsqueda
  const getSectionTitle = () => {
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
  };

  // Determinar el mensaje descriptivo según el contexto
  const getDescriptiveMessage = () => {
    if (!parkingSpots?.length) {
      return t('parking.tryDifferentLocation', 'Intenta con otra ubicación o amplía tu área de búsqueda');
    }

    return parkingSpots.length === 1
      ? t('parking.oneSpotFound', 'Se encontró {{count}} parqueadero en tu área', { count: 1 })
      : t('parking.multipleSpotFound', 'Se encontraron {{count}} parqueaderos en tu área', { count: parkingSpots.length });
  };

  const handleParkingSpotSelected = useCallback(({ spot, navigate }) => {
    setSelectedSpot(spot);
    setSpotNavigation(() => navigate);
  }, []);

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

  // Función mejorada para manejar el clic en la tarjeta de parqueadero
  const handleParkingCardClick = useCallback((parking) => {
    setSelectedSpot(parking);

    // Utilizar la referencia al mapa para centrar en el parqueadero seleccionado
    if (mapRef.current && mapRef.current.centerOnSpot) {
      mapRef.current.centerOnSpot(parking);
    }
  }, [setSelectedSpot]);

  return (
    <div className="flex flex-col min-h-screen relative bg-gray-50">
      <header className={getHeaderClassName({
        showShadow: true,
        className: 'z-10 backdrop-blur-sm sticky top-0 bg-white/90 border-b border-gray-100 px-4 py-2'
      })}>
        <Link to="/" className="flex items-center">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mr-2 md:hidden"
          >
            <LuArrowLeft className="text-gray-600" />
          </motion.div>
          <Logo variant="secondary" />
        </Link>

        <MemoizedSearchBox
          ref={searchRef}
          className="flex-1 max-w-xl mx-2"
          placeholder="Busca cerca a tu destino..."
          useSearchHook={useSearchPlaces}
          onResultSelected={handleCustomPlaceSelected}
          value={searchTerm}
        >
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </MemoizedSearchBox>
      </header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 p-4 relative"
      >
        <AnimatePresence mode="wait">
          {isLoadingLocation && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Obteniendo ubicación...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-full"
        >
          <div className="h-full w-full bg-gray-100">
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
          </div>
        </motion.section>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="overflow-y-auto"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {getSectionTitle()}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {getDescriptiveMessage()}
            </p>
          </div>

          <AnimatePresence>
            {nearbySpots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <LuInfo className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-gray-700 font-medium mb-2">No encontramos parqueaderos</h3>
                <p className="text-gray-600 text-sm">
                  No encontramos parqueaderos en esta zona. Intenta buscar en otra ubicación.
                </p>
              </motion.div>
            ) : (
              nearbySpots.map((parking) => (
                <motion.div
                  key={parking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className={`mb-4 p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-primary/30 hover:shadow-md transition-all ${
                    selectedSpot?.id === parking.id ? 'border-primary border-opacity-70' : ''
                  }`}
                  onClick={() => handleParkingCardClick(parking)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-1.5 rounded-full text-primary mr-2">
                        <LuCar className="w-4 h-4" />
                      </div>
                      <h3 className="font-medium text-gray-800 text-base">
                        {parking.name}
                      </h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                      Abierto
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 text-xs mb-4">
                    <LuMapPin className="mr-1 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{parking.address}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-gray-700 text-sm">
                      <div className="bg-blue-50 p-1.5 rounded-full text-blue-600 mr-2">
                        <LuCar className="w-4 h-4" />
                      </div>
                      <span>{parking.available_spaces} disponibles</span>
                    </div>
                    <div className="flex items-center text-gray-700 text-sm">
                      <div className="bg-green-50 p-1.5 rounded-full text-green-600 mr-2">
                        <LuDollarSign className="w-4 h-4" />
                      </div>
                      <span>$60 a $100/min</span>
                    </div>
                  </div>

                  {spotNavigation && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        spotNavigation();
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02]"
                      aria-label="Navegar al parqueadero seleccionado"
                    >
                      <LuNavigation className="w-5 h-5 animate-pulse" />
                      <span className="font-medium">Navegar</span>
                    </Button>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.section>
      </motion.main>

      {/* Footer compacto para la página de parqueaderos */}
      <footer className="py-3 px-4 bg-white border-t border-gray-100 text-center text-sm text-gray-500">
        <div className="container mx-auto flex flex-wrap justify-center items-center gap-4">
          <div>© {new Date().getFullYear()} ParkiÜ</div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hover:text-primary">Nosotros</Link>
            <Link to="/terms" className="hover:text-primary">Términos</Link>
            <Link to="/privacy" className="hover:text-primary">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
