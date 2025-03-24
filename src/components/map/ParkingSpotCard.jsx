import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaCar, FaClock, FaMotorcycle, FaBiking} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Badge } from '@/components/common/Badge';
import { Link } from 'react-router-dom';

const ParkingSpotCard = memo(({ parking, onClick, index, variant = 'desktop' }) => {
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
  const isMobile = variant === 'mobile';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className={`
        bg-white border rounded-lg cursor-pointer overflow-hidden
        ${isMobile ? 'w-[280px] snap-center flex-none' : 'w-full'}
        ${isParkiu
          ? 'border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-200'
          : 'border-gray-200 hover:border-gray-300'
        }`}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`w-full h-0.5 ${isParkiu ? 'bg-blue-500' : 'bg-gray-200'}`} />

        <div className={`${isMobile ? 'p-2' : 'p-2 sm:p-3'}`}>
          <div className="flex justify-between items-start gap-1 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="text-xs font-medium line-clamp-1 text-gray-900">
                  {formatTitle(parking.name)}
                </h3>
                {isParkiu ? (
                  <div className="flex items-center gap-0.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      <img src="/icons/providers/parkiu.svg" alt="Parkiu" className="w-2.5 h-2.5 mr-0.5" />
                      Parkiu
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                      <img src="/icons/providers/google.svg" alt="Google" className="w-2.5 h-2.5 mr-0.5" />
                      Google
                    </span>
                  </div>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1.5">
            <div className="flex items-center flex-1 min-w-0">
              <FaMapMarkerAlt className={`mr-0.5 flex-shrink-0 ${isParkiu ? 'text-blue-400' : 'text-gray-400'} w-3 h-3`} />
              <span className="line-clamp-1">{parking.address}</span>
            </div>
            {parking.distance && (
              <div className="flex items-center ml-1 text-gray-500 whitespace-nowrap">
                <span>{parking.distance.toFixed(1)} metros</span>
              </div>
            )}
          </div>

          {isParkiu ? (
            <>
              <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                <div className="flex items-center text-xs p-1.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  <FaCar className="mr-1.5 w-3 h-3 text-blue-400" />
                  <div>
                    <span className="font-medium">{parking.available_spaces}</span>
                    <span className="text-[10px] ml-0.5">disponibles</span>
                  </div>
                </div>
                {parking.price_per_hour > 0 && (
                  <div className="flex flex-col p-1.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    <div className="flex items-center">
                      <FaClock className="mr-1.5 w-3 h-3 text-blue-400" />
                      <div>
                        <span className="font-medium text-xs">{formatPrice(parking.price_per_hour)}</span>
                        <span className="text-[10px] ml-0.5">/hora</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {parking.carSpaces > 0 && (
                  <div className="flex items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 border border-gray-200">
                    <FaCar className="mr-0.5 w-2.5 h-2.5" />
                    <span>{parking.carSpaces} carros</span>
                  </div>
                )}
                {parking.motorcycleSpaces > 0 && (
                  <div className="flex items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 border border-gray-200">
                    <FaMotorcycle className="mr-0.5 w-2.5 h-2.5" />
                    <span>{parking.motorcycleSpaces} motos</span>
                  </div>
                )}
                {parking.bikeSpaces > 0 && (
                  <div className="flex items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 border border-gray-200">
                    <FaBiking className="mr-0.5 w-2.5 h-2.5" />
                    <span>{parking.bikeSpaces} bicis</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              {parking.rating > 0 && (
                <div className="flex items-center text-gray-700 text-xs bg-gray-50 p-1.5 rounded border border-gray-200">
                  <span className="text-yellow-500 mr-0.5">★</span>
                  <span className="font-medium">{parking.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-[10px] ml-0.5">({parking.userRatingCount} reseñas)</span>
                </div>
              )}
              {isMobile ? (
                <div className="flex items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 border border-gray-200">
                  <span className="font-medium">¿Administras este parqueadero?</span>
                </div>
              ) : (
                <Link
                  to="/admin/landing"
                  className="block text-[10px] bg-gray-50 p-1.5 rounded border border-gray-200 hover:bg-gray-100 transition-colors duration-200 group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-medium text-gray-900 group-hover:text-gray-700">¿Eres el administrador?</span>
                  <br />
                  <span className="text-gray-600 group-hover:text-gray-500">
                    Únete a Parkiu y gestiona tu parqueadero en tiempo real
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        {index === 0 && (
          <div className="absolute -right-1 -top-1">
            <Badge variant="primary" className="shadow-md text-[10px] bg-blue-600 text-white border-blue-700 px-2 py-0.5">
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
    is_open: PropTypes.bool,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  index: PropTypes.number,
  variant: PropTypes.oneOf(['desktop', 'mobile']),
};

export default ParkingSpotCard;
