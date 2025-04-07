import { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaCar, FaClock, FaStar, FaShieldAlt, FaParking } from 'react-icons/fa';
import { SiGooglestreetview } from 'react-icons/si';
import { Badge } from '@/components/common/Badge';

const ParkingSpotCard = memo(({ spot, isSelected, onClick, onSelect, variant = 'default' }) => {
  console.log('ParkingSpotCard renderizado:', {
    spotId: spot.id,
    spotName: spot.name,
    isSelected,
    variant,
    hasOnClick: !!onClick,
    hasOnSelect: !!onSelect
  });

  const handleClick = useCallback((e) => {
    console.log('Click en ParkingSpotCard:', {
      spotId: spot.id,
      spotName: spot.name,
      eventType: e.type
    });

    e.stopPropagation();

    if (onClick) {
      console.log('Llamando onClick con spot:', spot);
      onClick(spot);
    } else if (onSelect) {
      console.log('Llamando onSelect con spot:', spot);
      onSelect(spot);
    } else {
      console.warn('Ni onClick ni onSelect están definidos');
    }
  }, [spot, onClick, onSelect]);

  const distanceText = useMemo(() => {
    if (spot.distance == null) return null;
    return spot.distance < 1
      ? `${Math.round(spot.distance * 1000)}m`
      : `${spot.distance.toFixed(1)}km`;
  }, [spot.distance]);

  const headerContent = useMemo(() => (
    <div className="flex items-start gap-2">
      <div className="flex-1 min-w-0 flex gap-2">
        {spot.isGooglePlace ? (
          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center">
            <SiGooglestreetview className="w-4 h-4 text-blue-600" />
          </div>
        ) : (
          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary-50 flex items-center justify-center">
            <FaParking className="w-4 h-4 text-primary-500" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {spot.name}
          </h3>
          <div className="flex items-start gap-1 mt-0.5">
            <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-500 line-clamp-2">
              {spot.address}
            </p>
          </div>
        </div>
      </div>
      {distanceText && (
        <div className="flex-shrink-0">
          <Badge variant="info" size="small" className="whitespace-nowrap">
            {distanceText}
          </Badge>
        </div>
      )}
    </div>
  ), [spot.isGooglePlace, spot.name, spot.address, distanceText]);

  const googleContent = useMemo(() => (
    spot.rating && (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <FaStar className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-gray-900">
            {spot.rating.toFixed(1)}
          </span>
          {spot.user_ratings_total && (
            <span className="text-xs text-gray-500">
              ({spot.user_ratings_total})
            </span>
          )}
        </div>
      </div>
    )
  ), [spot.rating, spot.user_ratings_total]);

  const parkiuContent = useMemo(() => (
    <>
      <div className="flex items-center justify-between">
        {spot.is_open !== undefined && (
          <Badge
            variant={spot.is_open ? "success" : "error"}
            size="small"
          >
            {spot.is_open ? "Abierto" : "Cerrado"}
          </Badge>
        )}
        {spot.has_security && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FaShieldAlt className="w-3.5 h-3.5 text-primary-500" />
            Vigilado 24/7
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
              <FaCar className="w-3.5 h-3.5 text-primary-500" />
            </div>
            <div>
              <span className="font-medium text-gray-900">
                {spot.available_spaces ?? '?'}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                disponibles
              </span>
            </div>
          </div>
          {spot.price_per_hour != null && (
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                <FaClock className="w-3.5 h-3.5 text-primary-500" />
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  ${spot.price_per_hour.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  /hora
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  ), [
    spot.is_open,
    spot.has_security,
    spot.available_spaces,
    spot.price_per_hour
  ]);

  return (
    <div
      className={`
        bg-white rounded-lg border transition-all cursor-pointer
        ${variant === 'carousel' ? 'w-[300px] flex-none snap-start' : 'w-full'}
        ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md border-gray-200'}
        ${variant === 'carousel' ? 'p-3 sm:p-4' : 'p-3 sm:p-4'}
      `}
      onClick={handleClick}
      role="button"
      aria-pressed={isSelected}
    >
      <div className="flex flex-col gap-3">
        {headerContent}
        {spot.isGooglePlace ? googleContent : parkiuContent}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.spot.id === nextProps.spot.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.variant === nextProps.variant &&
    prevProps.spot.available_spaces === nextProps.spot.available_spaces &&
    prevProps.spot.is_open === nextProps.spot.is_open
  );
});

ParkingSpotCard.displayName = 'ParkingSpotCard';

ParkingSpotCard.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    available_spaces: PropTypes.number,
    distance: PropTypes.number,
    isGooglePlace: PropTypes.bool,
    price_per_hour: PropTypes.number,
    rating: PropTypes.number,
    user_ratings_total: PropTypes.number,
    is_open: PropTypes.bool,
    has_security: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'carousel'])
};

export default ParkingSpotCard;
