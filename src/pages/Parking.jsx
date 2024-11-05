import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useContext, useState } from 'react';
import { LuCar, LuDollarSign, LuNavigation, LuSearch } from 'react-icons/lu';
import { Link } from 'react-router-dom';

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

export default function Parking() {
  const { parkingSpots, targetLocation, setTargetLocation } =
    useContext(ParkingContext);
  const { user } = useContext(UserContext);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [spotNavigation, setSpotNavigation] = useState(null);

  const { location: userLocation } = user;

  const { nearbySpots } = useNearbyParkingSpots({
    spots: parkingSpots,
    center: targetLocation || userLocation,
    limit: DEFAULT_LIMIT,
    maxRadius: DEFAULT_MAX_DISTANCE,
  });

  const handleParkingSpotSelected = useCallback(({ spot, navigate }) => {
    setSelectedSpot(spot);
    setSpotNavigation(() => navigate);
  }, []);

  const handleCustomPlaceSelected = useCallback(
    (place) => {
      setTargetLocation({
        lat: place.location.latitude,
        lng: place.location.longitude,
      });
    },
    [setTargetLocation],
  );

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col">
      <header
        className={getHeaderClassName({
          className: 'gap-6 bg-white sticky md:relative top-0 z-10',
        })}
      >
        <Link to="/">
          <Logo variant="secondary" />
        </Link>
        <SearchBox
          className="max-w-xs md:max-w-sm flex-1 translate-y-px"
          placeholder="Busca cerca a tu destino..."
          useSearchHook={useSearchPlaces}
          onResultSelected={handleCustomPlaceSelected}
        >
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
        </SearchBox>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-1 max-w-6xl mx-auto">
        <section className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-full min-h-[400px] bg-secondary-100 flex items-center justify-center">
            <Map
              onParkingSpotSelected={handleParkingSpotSelected}
              selectedSpot={selectedSpot}
              setSelectedSpot={setSelectedSpot}
            />
          </div>
        </section>

        <section className="overflow-y-auto h-[calc(100vh-200px)]">
          <h2 className="text-2xl font-medium text-secondary-800 mb-2">
            Spots cercanos
          </h2>
          <small className="text-secondary-600 text-base font-light mb-4 block">
            Selecciona un parqueadero en el mapa para ver sus spots
            disponibles...
          </small>
          <AnimatePresence>
            {nearbySpots.map((parking) => (
              <motion.div
                key={parking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
                className={`mb-4 p-4 bg-white rounded-xl shadow-md border border-transparent hover:border-sky-500 transition-all ${
                  selectedSpot?.id === parking.id ? 'border-sky-500' : ''
                }`}
                onClick={() => setSelectedSpot(parking)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-secondary-800">
                    {parking.name}
                  </h3>
                  <span className="text-sm text-secondary-500">
                    {parking.address}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <LuCar className="w-5 h-5 text-sky-500" />
                    <span className="text-sm text-secondary-600">
                      {parking.available_spaces} disponibles
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LuDollarSign className="w-5 h-5 text-dark-green-emerald" />
                    <span className="text-sm text-secondary-600">
                      60 a 100/min
                    </span>
                  </div>
                </div>

                {spotNavigation && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      spotNavigation();
                    }}
                    className="text-white bg-sky-500 hover:bg-sky-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-full"
                    aria-label="Navegar al parqueadero seleccionado"
                  >
                    <LuNavigation className="w-5 h-5" />
                    Navegar
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
