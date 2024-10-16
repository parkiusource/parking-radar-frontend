import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { LuCar, LuDollarSign, LuSearch, LuNavigation } from 'react-icons/lu';
import { RiEBike2Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';

import { Button } from '@/components/common';
import Map from '@/components/Map';
import Logo from '@/components/Logo';

// @TODO: Real data fetching
const parkings = [
  {
    id: 1,
    name: 'Parking Universidad Antonio Nariño',
    address: 'Cl. 58a #37 - 94',
    spots: [
      {
        id: 1,
        type: 'car',
        floor: 1,
        requireKeys: false,
        pricePerMinute: 100,
        available: true,
      },
      {
        id: 2,
        type: 'bike',
        floor: 2,
        requireKeys: false,
        pricePerMinute: 60,
        available: true,
      },
    ],
  },
  {
    id: 34,
    name: 'Parking - Peter',
    spots: [],
  },
];

export default function Parking() {
  const [selectedSpot, setSelectedSpot] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParking, setSelectedParking] = useState(null);

  const [spotNavigation, setSpotNavigation] = useState(null);

  const onParkingSpotSelected = ({ spot, navigate }) => {
    const foundParking = parkings.find((p) => p.id === spot.id);
    if (foundParking?.spots?.length) {
      setSelectedParking(foundParking);
    }
    setSpotNavigation(() => navigate);
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-semibold text-secondary-800 flex items-center">
              <Logo variant="secondary" className="-translate-y-1 mr-1" />
              Parkify
            </h1>
          </Link>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar parqueadero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4 max-w-6xl mx-auto w-full">
        <section className="w-full md:w-2/3 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-full min-h-[400px] bg-secondary-100 flex items-center justify-center">
            <Map onParkingSpotSelected={onParkingSpotSelected} />
          </div>
        </section>
        <section className="w-full md:w-1/3">
          <div className="mb-4">
            <h2 className="text-2xl font-medium text-secondary-700 mb-2">
              Spots cercanos
            </h2>
            <small className="text-secondary-500 text-base font-light">
              Selecciona un parqueadero en el mapa para ver sus spots
              disponibles...
            </small>
          </div>
          <div className="overflow-y-scroll h-[calc(100vh-200px)]">
            <AnimatePresence>
              {(selectedParking ? [selectedParking] : parkings).map(
                ({ id, name, spots, address }) => {
                  const carSpots = (spots ?? []).filter(
                    (s) => s && s.type === 'car',
                  );
                  const bikeSpots = (spots ?? []).filter(
                    (s) => s && s.type === 'bike',
                  );
                  return (
                    <motion.div
                      key={`parking_${id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <div
                        className={`mb-4 p-4 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md ${selectedSpot === id ? 'border-l-4 border-sky-500' : ''}`}
                        onClick={() => setSelectedSpot(id)}
                      >
                        <div className="flex justify-between items-start mb-2 flex-col">
                          <h3 className="font-medium text-secondary-800">
                            {name}
                          </h3>
                          <span className="text-sm text-secondary-500">
                            {address}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                              <LuCar className="w-4 h-4 text-sky-500 mr-2" />
                              <span className="text-sm text-secondary-600">
                                {carSpots.length || 0} disponibles
                              </span>
                            </div>
                            <div className="flex items-center">
                              <RiEBike2Line className="w-4 h-4 text-sky-500 mr-2" />
                              <span className="text-sm text-secondary-600">
                                {bikeSpots.length || 0} disponibles
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <LuDollarSign className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-secondary-600">
                              60 a 100/min
                            </span>
                          </div>
                        </div>
                        {typeof spotNavigation === 'function' && (
                          <div className="flex gap-2 w-full justify-end">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                spotNavigation();
                              }}
                              className="text-white flex items-center gap-2"
                            >
                              <LuNavigation className="w-5 h-5" />
                              <span>Navegar</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                },
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
