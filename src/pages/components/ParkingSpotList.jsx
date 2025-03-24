import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaCar, FaClock, FaBiking, FaMotorcycle, FaInfoCircle } from 'react-icons/fa';
import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/common/Badge';
import { Link } from 'react-router-dom';

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
      className={`bg-white border rounded-lg cursor-pointer overflow-hidden ${
        isParkiu
          ? 'border-blue-100 hover:border-blue-200 transition-all duration-200'
          : 'border-gray-200 hover:border-blue-100'
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`w-full h-0.5 ${isParkiu ? 'bg-blue-200' : 'bg-blue-100'}`} />

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium line-clamp-1 ${isParkiu ? 'text-gray-700' : 'text-gray-900'}`}>
                  {parking.name}
                </h3>
                {isParkiu ? (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                      <img src="/icons/providers/parkiu.svg" alt="Parkiu" className="w-3 h-3 mr-1" />
                      Parkiu
                    </span>
                    <div className="relative group">
                      <FaInfoCircle className="flex-shrink-0 cursor-help text-blue-300 hover:text-blue-400" />
                      <div className="absolute top-0 left-full mt-0 ml-1 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
                        <div className="relative">
                          Parqueadero verificado y monitoreado en tiempo real por Parkiu
                          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                      <img src="/icons/providers/google.svg" alt="Google" className="w-3 h-3 mr-1" />
                      Google
                    </span>
                    <div className="relative group">
                      <FaInfoCircle className="flex-shrink-0 cursor-help text-gray-400 hover:text-gray-500" />
                      <div className="absolute top-0 left-full mt-0 ml-1 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
                        <div className="relative">
                          Información proporcionada por Google Places, puede no estar actualizada
                          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center justify-between text-gray-600 text-xs mb-3">
            <div className="flex items-center flex-1 min-w-0">
              <FaMapMarkerAlt className={`mr-1 flex-shrink-0 ${isParkiu ? 'text-blue-300' : 'text-gray-400'}`} />
              <span className="line-clamp-1">{parking.address}</span>
            </div>
            {parking.distance && (
              <div className="flex items-center ml-2 text-gray-500 whitespace-nowrap">
                <span>{parking.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {isParkiu ? (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center text-gray-700 text-sm bg-white p-2 rounded border border-blue-50">
                  <FaCar className="mr-2 text-blue-300" />
                  <span className="font-medium">{parking.available_spaces} espacios</span>
                </div>
                {parking.price_per_hour > 0 && (
                  <div className="flex flex-col text-gray-700 text-sm bg-white p-2 rounded border border-blue-50">
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-blue-300" />
                      <span className="font-medium">{formatPrice(parking.price_per_hour)}</span>
                      <span className="text-xs ml-1">/hora</span>
                    </div>
                    {parking.price_per_minute > 0 && (
                      <div className="flex items-center mt-1 text-xs text-gray-600">
                        <span className="font-medium">{formatPrice(parking.price_per_minute)}</span>
                        <span className="ml-1">/minuto</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {parking.carSpaces > 0 && (
                  <div className="flex items-center text-xs bg-white text-blue-500 px-2 py-1 rounded border border-blue-50">
                    <FaCar className="mr-1" />
                    <span>{parking.carSpaces}</span>
                  </div>
                )}
                {parking.motorcycleSpaces > 0 && (
                  <div className="flex items-center text-xs bg-white text-blue-500 px-2 py-1 rounded border border-blue-50">
                    <FaMotorcycle className="mr-1" />
                    <span>{parking.motorcycleSpaces}</span>
                  </div>
                )}
                {parking.bikeSpaces > 0 && (
                  <div className="flex items-center text-xs bg-white text-blue-500 px-2 py-1 rounded border border-blue-50">
                    <FaBiking className="mr-1" />
                    <span>{parking.bikeSpaces}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {parking.rating > 0 && (
                <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{parking.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-xs ml-1">({parking.userRatingCount} reseñas)</span>
                </div>
              )}
              <Link
                to="/admin/landing"
                className="block text-xs bg-gray-50 p-2 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200 group"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="font-medium text-gray-900 group-hover:text-blue-600">¿Eres el administrador?</span>
                <br />
                <span className="text-gray-600 group-hover:text-blue-500">
                  Únete a Parkiu y gestiona tu parqueadero en tiempo real
                </span>
              </Link>
            </div>
          )}
        </div>

        {index === 0 && (
          <div className="absolute -left-1 -top-1">
            <Badge variant="primary" className="shadow-sm">
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
