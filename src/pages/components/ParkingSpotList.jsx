import PropTypes from 'prop-types';
import { LuMapPin, LuCar, LuClock, LuMotorcycle, LuBike } from 'react-icons/lu';
import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/Badge';

const ParkingSpotCard = memo(({ parking, onClick, index }) => {
  const formatPrice = useCallback((price) => {
    return Number(price).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }, []);

  const getStatusBadge = useCallback(() => {
    const isParkiu = !parking.isGooglePlace;

    if (isParkiu) {
      if (parking.available_spaces > 0) {
        return <Badge variant="success" size="small">Disponible</Badge>;
      }
      return <Badge variant="error" size="small">Lleno</Badge>;
    } else {
      if (parking.businessStatus === 'OPERATIONAL') {
        return <Badge variant="success" size="small">Abierto</Badge>;
      }
      return <Badge variant="error" size="small">Cerrado</Badge>;
    }
  }, [parking]);

  const isParkiu = !parking.isGooglePlace;

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
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">{parking.name}</h3>
              {isParkiu ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                  Parkiu
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  Google Places
                </span>
              )}
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center text-gray-600 text-xs mb-3">
            <LuMapPin className="mr-1 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-1">{parking.address}</span>
          </div>

          {isParkiu ? (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded">
                  <LuCar className="mr-2 text-emerald-600" />
                  <span>{parking.available_spaces} espacios</span>
                </div>
                {parking.price && (
                  <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded">
                    <LuClock className="mr-2 text-emerald-600" />
                    <span className="font-medium">{formatPrice(parking.price)}</span>
                    <span className="text-xs ml-1">/hora</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {parking.carSpaces > 0 && (
                  <div className="flex items-center text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                    <LuCar className="mr-1" />
                    <span>{parking.carSpaces}</span>
                  </div>
                )}
                {parking.motorcycleSpaces > 0 && (
                  <div className="flex items-center text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                    <LuMotorcycle className="mr-1" />
                    <span>{parking.motorcycleSpaces}</span>
                  </div>
                )}
                {parking.bikeSpaces > 0 && (
                  <div className="flex items-center text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                    <LuBike className="mr-1" />
                    <span>{parking.bikeSpaces}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded">
                <LuCar className="mr-2 text-blue-600" />
                <span>{parking.distance.toFixed(1)} km</span>
              </div>
              {parking.rating && (
                <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{parking.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-xs ml-1">({parking.userRatingCount} reseñas)</span>
                </div>
              )}
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                ¿Eres el administrador? Únete a Parkiu y gestiona tu parqueadero en tiempo real.
              </div>
            </div>
          )}
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
});

ParkingSpotCard.displayName = 'ParkingSpotCard';

ParkingSpotCard.propTypes = {
  parking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    isGooglePlace: PropTypes.bool,
    available_spaces: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    businessStatus: PropTypes.string,
    rating: PropTypes.number,
    userRatingCount: PropTypes.number,
    price: PropTypes.number,
    carSpaces: PropTypes.number,
    motorcycleSpaces: PropTypes.number,
    bikeSpaces: PropTypes.number,
    distance: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  index: PropTypes.number,
};

const ParkingSpotList = memo(({ spots, onSpotClick }) => {
  return (
    <div className="space-y-2">
      {spots.map((spot, index) => (
        <ParkingSpotCard
          key={`${spot.id}-${index}`}
          parking={spot}
          onClick={() => onSpotClick(spot)}
          index={index}
        />
      ))}
    </div>
  );
});

ParkingSpotList.displayName = 'ParkingSpotList';

ParkingSpotList.propTypes = {
  spots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      available_spaces: PropTypes.number.isRequired,
      rating: PropTypes.number,
      min_price: PropTypes.number.isRequired,
      formattedDistance: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSpotClick: PropTypes.func.isRequired,
};

export default ParkingSpotList;
