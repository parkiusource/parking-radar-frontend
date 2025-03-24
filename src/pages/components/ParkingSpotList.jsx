import PropTypes from 'prop-types';
import { FaBiking, FaMotorcycle } from 'react-icons/fa';
import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/common/Badge';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Car } from 'lucide-react';

const ParkingSpotCard = memo(({ parking, onClick, index }) => {
  const formatPrice = useCallback((price) => {
    return Number(price).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }, []);

  const formatTitle = useCallback((title) => {
    return title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  const getStatusBadge = useCallback(() => {
    const isParkiu = !parking.isGooglePlace;

    if (isParkiu) {
      if (parking.available_spaces > 0) {
        return <Badge variant="success" size="small" className="bg-green-50 text-green-700 border-green-200">Disponible</Badge>;
      }
      return <Badge variant="error" size="small" className="bg-red-50 text-red-700 border-red-200">Lleno</Badge>;
    } else {
      if (parking.businessStatus === 'OPERATIONAL') {
        return <Badge variant="success" size="small" className="bg-blue-50 text-blue-700 border-blue-200">Abierto</Badge>;
      }
      return <Badge variant="error" size="small" className="bg-gray-50 text-gray-700 border-gray-200">Cerrado</Badge>;
    }
  }, [parking]);

  const isParkiu = !parking.isGooglePlace;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className={`bg-white border rounded-lg cursor-pointer overflow-hidden
        ${isParkiu
          ? 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200'
          : 'border-gray-200 hover:border-gray-300'
        }`}
      onClick={onClick}
    >
      <div className="relative">
        {index === 0 && (
          <div className="absolute -right-1 -top-1 z-10">
            <Badge variant="primary" className="text-[10px] bg-gray-900 text-white border-gray-800 px-2 py-1 shadow-lg">
              Más cercano
            </Badge>
          </div>
        )}

        <div className={`w-full h-0.5 ${isParkiu ? 'bg-gray-300' : 'bg-gray-200'}`} />

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
                {formatTitle(parking.name)}
              </h3>
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span className="line-clamp-1">{parking.address}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getStatusBadge()}
              {isParkiu ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                  <img src="/icons/providers/parkiu.svg" alt="Parkiu" className="w-2.5 h-2.5 mr-0.5" />
                  Parkiu
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                  <img src="/icons/providers/google.svg" alt="Google" className="w-2.5 h-2.5 mr-0.5" />
                  Google
                </span>
              )}
            </div>
          </div>

          {isParkiu ? (
            <>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center p-2 rounded bg-gray-50 border border-gray-200">
                  <Car className="w-3.5 h-3.5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {parking.available_spaces}
                      <span className="text-xs font-normal text-gray-600 ml-1">disponibles</span>
                    </p>
                  </div>
                </div>

                {parking.price_per_hour > 0 && (
                  <div className="flex items-center p-2 rounded bg-gray-50 border border-gray-200">
                    <DollarSign className="w-3.5 h-3.5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(parking.price_per_hour)}
                        <span className="text-xs font-normal text-gray-600 ml-1">/hora</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {parking.carSpaces > 0 && (
                  <div className="flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-200">
                    <Car className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-700">{parking.carSpaces} carros</span>
                  </div>
                )}
                {parking.motorcycleSpaces > 0 && (
                  <div className="flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-200">
                    <FaMotorcycle className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-700">{parking.motorcycleSpaces} motos</span>
                  </div>
                )}
                {parking.bikeSpaces > 0 && (
                  <div className="flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-200">
                    <FaBiking className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-700">{parking.bikeSpaces} bicis</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {parking.rating > 0 && (
                <div className="flex items-center p-2 rounded bg-gray-50 border border-gray-200">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="text-sm font-medium text-gray-900">{parking.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-600 ml-1">({parking.userRatingCount} reseñas)</span>
                </div>
              )}
              <Link
                to="/admin/landing"
                className="block p-2 rounded bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm font-medium text-gray-900">¿Eres el administrador?</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Únete a Parkiu y gestiona tu parqueadero en tiempo real
                </p>
              </Link>
            </div>
          )}

          {parking.distance && (
            <div className="mt-2 flex items-center justify-end text-xs text-gray-500">
              <span>{parking.distance.toFixed(1)} metros</span>
            </div>
          )}
        </div>
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
  parking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    isGooglePlace: PropTypes.bool,
    available_spaces: PropTypes.number,
    businessStatus: PropTypes.string,
    rating: PropTypes.number,
    userRatingCount: PropTypes.number,
    price_per_hour: PropTypes.number,
    price_per_minute: PropTypes.number,
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
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center justify-between px-2 md:px-0 py-1 md:py-0">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-medium text-gray-900">Parqueaderos cercanos</h2>
          <span className="px-1.5 py-0.5 bg-gray-100 text-xs font-medium text-gray-600 rounded">
            {spots.length}
          </span>
        </div>
      </div>

      <div className="md:space-y-3">
        {spots.map((spot, index) => (
          <div key={`${spot.id}-${index}`} className="md:px-0">
            <ParkingSpotCard
              parking={spot}
              onClick={() => onSpotClick(spot)}
              index={index}
            />
          </div>
        ))}
      </div>
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
