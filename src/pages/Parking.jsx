import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuCar, LuDollarSign, LuSearch, LuNavigation } from 'react-icons/lu';
import { RiEBike2Line } from 'react-icons/ri';
import { Button } from '@/components/common';
import Map from '@/components/Map';
import Logo from '@/components/Logo';

const parkings = [
  {
    id: 1,
    name: 'Parking Universidad Antonio Nariño',
    address: 'Cl. 58a #37 - 94',
    spots: [
      { id: 1, type: 'car', pricePerMinute: 100, available: true },
    ],
  },
  { id: 34, name: 'Parking - Peter', spots: [] },
];

export default function Parking() {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParking, setSelectedParking] = useState(null);
  const [spotNavigation, setSpotNavigation] = useState(null);

  const handleParkingSpotSelected = ({ spot, navigate }) => {
    const foundParking = parkings.find((p) => p.id === spot.id);
    if (foundParking) setSelectedParking(foundParking);
    setSpotNavigation(() => navigate);
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-2xl font-semibold text-secondary-800">
            <Logo variant="secondary" className="-translate-y-1" />
            Parkify
          </Link>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar parqueadero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4 max-w-6xl mx-auto w-full">
        {/* Map Section */}
        <section className="w-full md:w-2/3 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-full min-h-[400px] bg-secondary-100 flex items-center justify-center">
            <Map onParkingSpotSelected={handleParkingSpotSelected} />
          </div>
        </section>

        {/* Parking Spots Section */}
        <section className="w-full md:w-1/3">
          <div className="mb-4">
            <h2 className="text-2xl font-medium text-secondary-700 mb-2">
              Parqueaderos cercanos
            </h2>
            <small className="text-secondary-500 text-base font-light">
              Selecciona un parqueadero en el mapa para ver sus espacios disponibles...
            </small>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            <AnimatePresence>
              {(selectedParking ? [selectedParking] : parkings).map((parking) => (
                <motion.div
                  key={parking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <div
                    className={`mb-4 p-4 bg-white rounded-lg shadow-sm transition-all duration-300 ${
                      selectedSpot === parking.id
                        ? 'border-l-4 border-sky-500'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedSpot(parking.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-secondary-800">{parking.name}</h3>
                      <span className="text-sm text-secondary-500">{parking.address}</span>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <LuCar className="w-4 h-4 text-sky-500 mr-2" />
                          <span className="text-sm text-secondary-600">
                            {parking.spots.filter((s) => s.type === 'car').length} disponibles
                          </span>
                        </div>
                        <div className="flex items-center">
                          <RiEBike2Line className="w-4 h-4 text-sky-500 mr-2" />
                          <span className="text-sm text-secondary-600">
                            {parking.spots.filter((s) => s.type === 'bike').length} disponibles
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <LuDollarSign className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-secondary-600">60 a 100/min</span>
                      </div>
                    </div>

                    {spotNavigation && (
                      <div className="flex justify-end">
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
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
