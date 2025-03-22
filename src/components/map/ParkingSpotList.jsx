import { forwardRef, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { LuCar, LuInfo, LuMapPin, LuClock, LuMotorcycle, LuBike, LuTarget } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/common/Badge';

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

const ParkingSpotCard = memo(({ parking, onClick, index }) => {
  const formatPrice = useCallback((price) => {
    return Number(price).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }, []);

  const getStatusBadge = useCallback(() => {
    if (parking.isActive) {
      return <Badge variant="success" size="small">Abierto</Badge>;
    }
    return <Badge variant="error" size="small">Cerrado</Badge>;
  }, [parking.isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className="bg-white border border-gray-200 rounded-lg cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900 line-clamp-1">{parking.name}</h3>
            {getStatusBadge()}
          </div>

          <div className="flex items-center text-gray-600 text-xs mb-3">
            <LuMapPin className="mr-1 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-1">{parking.address}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded">
              <LuCar className="mr-2 text-primary" />
              <span>{parking.distance.toFixed(1)} km</span>
            </div>
            <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded">
              <LuClock className="mr-2 text-primary" />
              <span className="font-medium">{formatPrice(parking.price)}</span>
              <span className="text-xs ml-1">/hora</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {parking.carSpaces > 0 && (
              <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                <LuCar className="mr-1" />
                <span>{parking.carSpaces}</span>
              </div>
            )}
            {parking.motorcycleSpaces > 0 && (
              <div className="flex items-center text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                <LuMotorcycle className="mr-1" />
                <span>{parking.motorcycleSpaces}</span>
              </div>
            )}
            {parking.bikeSpaces > 0 && (
              <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <LuBike className="mr-1" />
                <span>{parking.bikeSpaces}</span>
              </div>
            )}
          </div>
        </div>

        {index === 0 && (
          <div className="absolute -left-1 -top-1">
            <Badge variant="primary" className="shadow-sm border border-primary-200">
              Más cercano
            </Badge>
          </div>
        )}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return prevProps.parking.id === nextProps.parking.id &&
         prevProps.parking.isActive === nextProps.parking.isActive &&
         prevProps.index === nextProps.index;
});

ParkingSpotCard.displayName = 'ParkingSpotCard';

ParkingSpotCard.propTypes = {
  parking: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  index: PropTypes.number,
};
