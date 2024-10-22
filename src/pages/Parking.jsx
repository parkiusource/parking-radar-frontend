import { AnimatePresence, motion } from 'framer-motion';
import { LuCar, LuDollarSign, LuNavigation, LuSearch } from 'react-icons/lu';
import { useCallback, useContext, useState } from 'react';

import { Button } from '@/components/common';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Map from '@/components/Map';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';
import { useNearbyParkingSpots } from '@/hooks/useNearbySpots';

const DEFAULT_MAX_DISTANCE = 6000;
const DEFAULT_LIMIT = 10;

export default function Parking() {
  const { parkingSpots } = useContext(ParkingContext);
  const { user } = useContext(UserContext);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [spotNavigation, setSpotNavigation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { location: userLocation } = user;

  const { nearbySpots } = useNearbyParkingSpots({
    spots: parkingSpots,
    center: userLocation,
    limit: DEFAULT_LIMIT,
    maxRadius: DEFAULT_MAX_DISTANCE,
  });

  // **Manejar selección de parqueadero**
  const handleParkingSpotSelected = useCallback(({ spot, navigate }) => {
    setSelectedSpot(spot);
    setSpotNavigation(() => navigate);
  }, []);

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col">
      <header className="w-full bg-white shadow-md p-4 sticky top-0 z-[1010]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-semibold text-secondary-800 hover:text-sky-500 transition-colors"
            aria-label="Ir a la página principal"
          >
            <Logo variant="secondary" className="-translate-y-1" />
            <span className="whitespace-nowrap">Parkify</span>
          </Link>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar parqueadero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-1 max-w-6xl mx-auto">
        <section className="col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
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
                className={`mb-4 p-4 bg-white rounded-lg shadow-md border border-transparent hover:border-sky-500 transition-all ${
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
                    <LuDollarSign className="w-5 h-5 text-green-500" />
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
