import { AnimatePresence, motion, LazyMotion, domAnimation } from 'framer-motion';
import { useCallback, useContext, useState, useRef, Suspense, useMemo, useEffect, memo } from 'react';
import { Search, ArrowLeft, Info } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ParkingContext } from '@/context/parkingContextUtils';
import { UserContext } from '@/context/UserContext';
import { useNearbyParkingSpots } from '@/hooks/useNearbySpots';
import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';
import Map from '@/components/Map';
import { SearchBox } from '@/components/SearchBox';
import ParkingCarousel from '@/components/map/ParkingCarousel';
import ParkingSpotList from '@/pages/components/ParkingSpotList';

const DEFAULT_MAX_DISTANCE = 1000;
const DEFAULT_LIMIT = 10;

// Mensaje de no resultados memoizado
const NoResultsMessage = memo(() => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm"
  >
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Info className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-gray-700 font-medium mb-2">No encontramos parqueaderos</h3>
    <p className="text-gray-600 text-sm">
      No encontramos parqueaderos en esta zona. Intenta buscar en otra ubicación.
    </p>
  </motion.div>
));

NoResultsMessage.displayName = 'NoResultsMessage';

export default function Parking() {
  const { parkingSpots, targetLocation, setTargetLocation } = useContext(ParkingContext);
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const mapRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  // Memoizar el centro y los spots cercanos
  const spotCenter = useMemo(() =>
    targetLocation || user?.location,
    [targetLocation, user?.location]
  );

  const { nearbySpots } = useNearbyParkingSpots({
    spots: parkingSpots,
    center: spotCenter,
    limit: DEFAULT_LIMIT,
    maxRadius: DEFAULT_MAX_DISTANCE,
  });

  // Memoizar handlers
  const handleParkingSpotSelected = useCallback((data) => {
    setSelectedSpot(data.spot);
  }, []);

  const handleParkingCardClick = useCallback((parking) => {
    setSelectedSpot(prev => prev?.id === parking?.id ? null : parking);
    if (mapRef.current?.centerOnSpot) {
      mapRef.current.centerOnSpot(parking);
    }
  }, []);

  const handleCustomPlaceSelected = useCallback((place) => {
    setSelectedSpot(null);
    if (place.displayName) {
      setSearchTerm(place.displayName.text);
    }
    if (place.location) {
      setTargetLocation({
        lat: place.location.latitude,
        lng: place.location.longitude,
      });
    }
  }, [setTargetLocation]);

  // Efecto mejorado para manejar parámetros de URL
  useEffect(() => {
    if (initialSearchDone) return;

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const search = searchParams.get('search');
    const nearby = searchParams.get('nearby');

    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setTargetLocation({
          lat: parsedLat,
          lng: parsedLng
        });

        // Si es una búsqueda nearby, centrar el mapa inmediatamente
        if (nearby === 'true' && mapRef.current?.centerOnSpotWithoutPopup) {
          mapRef.current.centerOnSpotWithoutPopup({
            latitude: parsedLat,
            longitude: parsedLng
          });
        }
      }
    }

    if (search) {
      const decodedSearch = decodeURIComponent(search);
      setSearchTerm(decodedSearch);
    }

    setInitialSearchDone(true);
  }, [searchParams, setTargetLocation, initialSearchDone]);

  // Memoizar el conteo de spots para evitar recálculos
  const spotsCount = useMemo(() => parkingSpots?.length || 0, [parkingSpots]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col h-[100dvh] overflow-hidden bg-white">
        <header className={getHeaderClassName({
          showShadow: true,
          className: 'z-10 backdrop-blur-md sticky top-0 bg-white/95 border-b border-gray-100/50 flex items-center h-14'
        })}>
          <div className="w-full max-w-screen-2xl mx-auto px-3 flex items-center gap-2">
            <Link to="/" className="flex items-center group">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="mr-2 md:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
              </motion.div>
              <Logo variant="secondary" className="scale-75 md:scale-90" />
            </Link>

            <div className="relative flex-1 max-w-xl">
              <Suspense fallback={<div className="h-12 bg-gray-100 rounded-xl animate-pulse" />}>
                <SearchBox
                  className="w-full"
                  placeholder="Busca cerca a tu destino..."
                  useSearchHook={useSearchPlaces}
                  onResultSelected={handleCustomPlaceSelected}
                  value={searchTerm}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </SearchBox>
              </Suspense>
            </div>
          </div>
        </header>

        <ErrorBoundary>
          <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-0.5 p-0.5 md:p-4 relative overflow-hidden">
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 relative md:col-span-8 rounded-lg md:rounded-2xl shadow-lg md:h-full overflow-hidden"
            >
              <Map
                ref={mapRef}
                selectedSpot={selectedSpot}
                setSelectedSpot={setSelectedSpot}
                targetLocation={targetLocation}
                onParkingSpotSelected={handleParkingSpotSelected}
              />
            </motion.section>

            {/* Desktop Parking List */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block md:col-span-4 h-full bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-base font-semibold text-gray-900">
                  Parqueaderos cercanos
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {spotsCount} encontrados
                </p>
              </div>

              <div className="overflow-y-auto h-[calc(100%-4rem)] p-3">
                <AnimatePresence>
                  <ParkingSpotList
                    spots={nearbySpots}
                    selectedSpot={selectedSpot}
                    onSpotClick={handleParkingCardClick}
                  />
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Mobile Carousel */}
            {nearbySpots?.length > 0 && (
              <div className="h-[260px] md:hidden">
                <ParkingCarousel
                  parkingSpots={nearbySpots}
                  onSelect={handleParkingCardClick}
                />
              </div>
            )}
          </main>
        </ErrorBoundary>
      </div>
    </LazyMotion>
  );
}
