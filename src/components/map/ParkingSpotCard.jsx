import { memo } from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaCar, FaClock, FaMotorcycle, FaBicycle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Badge } from '@/components/common/Badge';

const ParkingSpotCard = memo(({ parking, onClick, index, variant = 'desktop' }) => {
  const isParkiu = !parking.isGooglePlace;
  const isMobile = variant === 'mobile';

  const getStatusInfo = () => {
    if (isParkiu) {
      return {
        variant: parking.available_spaces > 0 ? 'success' : 'error',
        text: parking.available_spaces > 0 ? 'Disponible' : 'Lleno'
      };
    }
    return {
      variant: parking.businessStatus === 'OPERATIONAL' ? 'success' : 'error',
      text: parking.is_open ? 'Abierto' : 'Cerrado'
    };
  };

  const status = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={`
        bg-white border rounded-lg cursor-pointer overflow-hidden
        ${isMobile ? 'w-[300px] snap-center flex-none' : 'w-full'}
        ${isParkiu ? 'border-blue-100' : 'border-gray-200'}
      `}
      onClick={onClick}
    >
      <div className="p-3">
        {/* Encabezado: Nombre, Proveedor y Estado */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate mb-1">
              {parking.name}
            </h3>
            <div className="flex items-center gap-1">
              <img
                src={`/icons/providers/${isParkiu ? 'parkiu' : 'google'}.svg`}
                alt={isParkiu ? 'Parkiu' : 'Google'}
                className="w-3 h-3"
              />
              <span className="text-xs text-gray-600">
                {isParkiu ? 'Parkiu' : 'Google Maps'}
              </span>
            </div>
          </div>
          <Badge variant={status.variant} size="small">{status.text}</Badge>
        </div>

        {/* Ubicación y Distancia */}
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <FaMapMarkerAlt className="flex-shrink-0 text-gray-400" />
          <span className="flex-1 truncate">{parking.address}</span>
          {parking.distance && (
            <span className="text-xs font-medium whitespace-nowrap">
              {parking.distance < 1000
                ? `${Math.round(parking.distance)}m`
                : `${(parking.distance / 1000).toFixed(1)}km`}
            </span>
          )}
        </div>

        {/* Información Principal */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FaCar className="text-gray-400" />
            <span className="font-medium text-gray-700">
              {isParkiu ? `${parking.available_spaces} espacios` : (parking.is_open ? 'Disponible' : 'Cerrado')}
            </span>
          </div>
          {parking.rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-gray-600">{parking.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Información Adicional (solo para Parkiu) */}
        {isParkiu && !isMobile && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600">
              {parking.price_per_hour > 0 && (
                <div className="flex items-center gap-1">
                  <FaClock className="text-gray-400" />
                  <span>${parking.price_per_hour}/hora</span>
                </div>
              )}
              <div className="flex gap-2">
                {parking.carSpaces > 0 && (
                  <span className="flex items-center gap-1">
                    <FaCar /> {parking.carSpaces}
                  </span>
                )}
                {parking.motorcycleSpaces > 0 && (
                  <span className="flex items-center gap-1">
                    <FaMotorcycle /> {parking.motorcycleSpaces}
                  </span>
                )}
                {parking.bikeSpaces > 0 && (
                  <span className="flex items-center gap-1">
                    <FaBicycle /> {parking.bikeSpaces}
                  </span>
                )}
              </div>
            </div>
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
    price_per_hour: PropTypes.number,
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
