import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { LuMapPin, LuInfo, LuTarget } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import ParkingSpotCard from './ParkingSpotCard';

export const ParkingSpotList = forwardRef(function ParkingSpotList(
  { parkingSpots, onSelect },
) {
  return (
    <div className="absolute z-10 top-3 right-3 w-80 md:w-96">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-primary to-primary-600 px-5 py-4 text-white flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center">
            <LuMapPin className="mr-2" />
            Spots cercanos
          </h2>
          <span className="text-xs bg-white/20 rounded-full px-2 py-1">
            {parkingSpots.length} encontrados
          </span>
        </div>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {parkingSpots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <LuInfo className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-gray-700 font-medium mb-2">No encontramos parqueaderos</h3>
                <p className="text-gray-600 text-sm">
                  No encontramos parqueaderos en esta zona. Intenta buscar en otra
                  ubicación.
                </p>
                <div className="mt-4 text-sm text-primary">
                  <span className="flex items-center justify-center cursor-pointer hover:underline">
                    <LuTarget className="mr-1" /> Explorar otras zonas
                  </span>
                </div>
              </motion.div>
            ) : (
              parkingSpots.map((parking, index) => (
                <ParkingSpotCard
                  key={parking.id}
                  parking={parking}
                  onClick={() => onSelect(parking)}
                  index={index}
                  variant="desktop"
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
});

ParkingSpotList.propTypes = {
  parkingSpots: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};
