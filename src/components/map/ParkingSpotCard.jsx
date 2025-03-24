import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaCar, FaClock, FaMotorcycle, FaBicycle, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';

const ParkingSpotCard = memo(({ parking, onClick, index, variant = 'desktop' }) => {
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
  const isMobile = variant === 'mobile';

  const ProviderBadge = () => (
    isParkiu ? (
      <div className="flex items-center gap-1">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          isMobile
            ? 'bg-blue-500 text-white border-none shadow-sm'
            : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          <img src="/icons/providers/parkiu.svg" alt="Parkiu" className="w-3 h-3 mr-1" />
          Parkiu
        </span>
        {!isMobile && (
          <div className="relative group">
            <FaInfoCircle className="flex-shrink-0 cursor-help text-blue-300 hover:text-blue-400" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
              <div className="relative">
                Parqueadero verificado y monitoreado en tiempo real por Parkiu
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full rotate-45 w-2 h-2 bg-gray-800"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isMobile
          ? 'bg-gray-500 text-white border-none shadow-sm'
          : 'bg-gray-50 text-gray-600 border border-gray-200'
      }`}>
        <img src="/icons/providers/google.svg" alt="Google" className="w-3 h-3 mr-1" />
        Google
      </span>
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className={`bg-white border rounded-lg cursor-pointer overflow-visible relative ${
        isMobile ? 'w-[360px] snap-center flex-none' : ''
      } ${
        isParkiu
          ? 'border-blue-100 hover:border-blue-200'
          : 'border-gray-200 hover:border-blue-100'
      }`}
      onClick={onClick}
    >
      {isMobile && (
        <div className="absolute -top-2.5 left-3 z-20">
          <ProviderBadge />
        </div>
      )}
      <div className="relative">
        <div className={`w-full h-0.5 ${isParkiu ? 'bg-blue-200' : 'bg-blue-100'}`} />
        <div className={`${isMobile ? 'p-4 pt-5' : 'p-4'}`}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className={`font-medium text-sm line-clamp-1 ${
                isMobile ? 'mt-1' : 'mb-1'
              } ${isParkiu ? 'text-gray-700' : 'text-gray-900'}`}>
                {parking.name}
              </h3>
              {!isMobile && <ProviderBadge />}
            </div>
            <div className={isMobile ? '-mt-1' : ''}>
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex items-center text-gray-600 text-xs mb-3">
            <div className="flex items-center flex-1 min-w-0">
              <FaMapMarkerAlt className={`mr-1 flex-shrink-0 ${isParkiu ? 'text-blue-300' : 'text-gray-400'}`} />
              <span className="line-clamp-1">{parking.address}</span>
            </div>
            {parking.distance && (
              <span className="text-xs text-gray-500 font-medium ml-1.5 whitespace-nowrap">
                {parking.distance < 1000
                  ? `${Math.round(parking.distance)}m`
                  : `${(parking.distance / 1000).toFixed(1)}km`}
              </span>
            )}
          </div>

          {isParkiu ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-gray-700 text-xs bg-white p-2 rounded border border-blue-50">
                  <FaCar className="mr-1.5 text-blue-300" />
                  <span className="font-medium">{parking.available_spaces} espacios</span>
                </div>
                {parking.price_per_hour > 0 && (
                  <div className="flex flex-col justify-center text-gray-700 text-xs bg-white p-2 rounded border border-blue-50">
                    <div className="flex items-center">
                      <FaClock className="mr-1.5 text-blue-300" />
                      <span className="font-medium">${parking.price_per_hour}</span>
                      <span className="text-xs ml-1">/hora</span>
                    </div>
                    {parking.price_per_minute > 0 && (
                      <div className="flex items-center text-xs text-gray-600 mt-0.5">
                        <span className="font-medium">${parking.price_per_minute}</span>
                        <span className="ml-1">/min</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isMobile && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {parking.carSpaces > 0 && (
                    <div className="flex items-center text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                      <FaCar className="mr-1" />
                      <span>{parking.carSpaces}</span>
                    </div>
                  )}
                  {parking.motorcycleSpaces > 0 && (
                    <div className="flex items-center text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                      <FaMotorcycle className="mr-1" />
                      <span>{parking.motorcycleSpaces}</span>
                    </div>
                  )}
                  {parking.bikeSpaces > 0 && (
                    <div className="flex items-center text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                      <FaBicycle className="mr-1" />
                      <span>{parking.bikeSpaces}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-1.5">
              {parking.rating > 0 && (
                <div className="flex items-center text-gray-700 text-xs bg-gray-50 p-1 rounded border border-gray-200">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{parking.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-xs ml-0.5">({parking.userRatingCount} reseñas)</span>
                </div>
              )}
              <Link
                to="/admin/landing"
                className={`block text-xs ${
                  isMobile
                    ? 'p-1.5 mt-1'
                    : 'p-2'
                } bg-gray-50 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200 group`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="font-medium text-gray-900 group-hover:text-blue-600">¿Eres el administrador?</span>
                {!isMobile && <br />}
                <span className={`text-gray-600 group-hover:text-blue-500 ${isMobile ? 'ml-1' : ''}`}>
                  Únete a Parkiu
                </span>
              </Link>
            </div>
          )}
        </div>

        {index === 0 && !isMobile && (
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
  variant: PropTypes.oneOf(['desktop', 'mobile']),
};

export default ParkingSpotCard;
