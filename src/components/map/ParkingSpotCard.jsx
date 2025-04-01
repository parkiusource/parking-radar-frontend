import { memo } from 'react';
import PropTypes from 'prop-types';
import { Star, Navigation } from 'lucide-react';
import { FaCar, FaMotorcycle, FaBiking } from 'react-icons/fa';

// Extracted Provider Badge component
const ProviderBadge = ({ isParkiu }) => (
  isParkiu ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex-shrink-0">
      <img src="/icons/providers/parkiu.svg" alt="Parkiu" width={12} height={12} className="w-3 h-3 mr-1" />
      Parkiu
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
      <img src="/icons/providers/google.svg" alt="Google" width={12} height={12} className="w-3 h-3 mr-1" />
      Google
    </span>
  )
);

// Extracted ParkiuDetails component
const ParkiuDetails = ({ spot, isCarousel }) => (
  <>
    <div className="flex items-center justify-between gap-2">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
        spot.available_spaces > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}>
        {spot.available_spaces > 0 ? `${spot.available_spaces} disponibles` : 'Lleno'}
      </span>
      {spot.price_per_hour > 0 && (
        <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full whitespace-nowrap">
          ${spot.price_per_hour.toLocaleString('es-CO')}/h
        </span>
      )}
    </div>

    {!isCarousel && <VehicleSpaces spot={spot} />}

    {!isCarousel && spot.price_per_minute > 0 && (
      <div className="text-xs text-gray-600">
        Tarifa por minuto: ${spot.price_per_minute.toLocaleString('es-CO')}
      </div>
    )}
  </>
);

// Extracted VehicleSpaces component
const VehicleSpaces = ({ spot }) => (
  <div className="flex flex-wrap gap-1.5">
    {spot.carSpaces > 0 && (
      <div className="flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
        <FaCar className="w-3 h-3 mr-1" />
        <span>{spot.carSpaces} carros</span>
      </div>
    )}
    {spot.motorcycleSpaces > 0 && (
      <div className="flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
        <FaMotorcycle className="w-3 h-3 mr-1" />
        <span>{spot.motorcycleSpaces} motos</span>
      </div>
    )}
    {spot.bikeSpaces > 0 && (
      <div className="flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
        <FaBiking className="w-3 h-3 mr-1" />
        <span>{spot.bikeSpaces} bicis</span>
      </div>
    )}
  </div>
);

// Extracted GooglePlacesDetails component
const GooglePlacesDetails = ({ spot, isCarousel }) => (
  <div className="flex items-center justify-between gap-2">
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
      spot.openNow ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
    }`}>
      {spot.openNow ? 'Abierto ahora' : 'Cerrado'}
    </span>
    {spot.rating > 0 && (
      <div className="flex items-center gap-1 text-xs">
        <Star className="w-3.5 h-3.5 text-yellow-400" />
        <span className="font-medium">{spot.rating.toFixed(1)}</span>
        {!isCarousel && spot.userRatingCount > 0 && (
          <span className="text-gray-500">
            ({spot.userRatingCount})
          </span>
        )}
      </div>
    )}
  </div>
);

// Extracted NavigateButton component
const NavigateButton = ({ onNavigate, isCarousel }) => (
  <button
    onClick={onNavigate}
    className={`
      w-full bg-primary hover:bg-primary-600 text-white flex gap-1.5 items-center justify-center
      transition-all shadow-sm hover:shadow rounded
      ${isCarousel ? 'py-1 px-2 text-xs mt-1' : 'py-1.5 px-3 text-sm mt-1.5'}
    `}
  >
    <Navigation className={isCarousel ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
    <span>Navegar</span>
  </button>
);

// Main component with reduced complexity
const ParkingSpotCard = memo(({ spot, isSelected, onSelect, onNavigate, variant = 'default' }) => {
  if (!spot) return null;

  const isParkiu = !spot.isGooglePlace;
  const isCarousel = variant === 'carousel';

  // Handle navigation click without propagation
  const handleNavigateClick = (e) => {
    e.stopPropagation();
    onNavigate();
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm transition-all
        ${isCarousel ? 'w-[280px] flex-none snap-center' : 'w-full'}
        ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}
        ${isCarousel ? 'p-2.5' : 'p-3'}
        cursor-pointer
      `}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-1.5">
        {/* Header with title and badges */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-bold text-gray-800 leading-tight line-clamp-2 flex-1 ${isCarousel ? 'text-sm' : 'text-base'}`}>
              {spot.name}
            </h3>
            <ProviderBadge isParkiu={isParkiu} />
          </div>

          {/* Address and distance */}
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-gray-600 line-clamp-1 flex-1">
              {spot.address}
            </p>
            {spot.formattedDistance && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                A {spot.formattedDistance}
              </span>
            )}
          </div>
        </div>

        {/* Main spot details based on provider */}
        {isParkiu
          ? <ParkiuDetails spot={spot} isCarousel={isCarousel} />
          : <GooglePlacesDetails spot={spot} isCarousel={isCarousel} />
        }

        {/* Navigation button */}
        <NavigateButton onNavigate={handleNavigateClick} isCarousel={isCarousel} />
      </div>
    </div>
  );
});

ParkingSpotCard.displayName = 'ParkingSpotCard';

// PropTypes definitions
const spotShape = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  isGooglePlace: PropTypes.bool,
  available_spaces: PropTypes.number,
  total_spaces: PropTypes.number,
  price_per_hour: PropTypes.number,
  price_per_minute: PropTypes.number,
  carSpaces: PropTypes.number,
  motorcycleSpaces: PropTypes.number,
  bikeSpaces: PropTypes.number,
  rating: PropTypes.number,
  userRatingCount: PropTypes.number,
  openNow: PropTypes.bool,
  formattedDistance: PropTypes.string,
};

// Add PropTypes to extracted components
ProviderBadge.propTypes = {
  isParkiu: PropTypes.bool.isRequired
};

ParkiuDetails.propTypes = {
  spot: PropTypes.shape(spotShape).isRequired,
  isCarousel: PropTypes.bool.isRequired
};

VehicleSpaces.propTypes = {
  spot: PropTypes.shape(spotShape).isRequired
};

GooglePlacesDetails.propTypes = {
  spot: PropTypes.shape(spotShape).isRequired,
  isCarousel: PropTypes.bool.isRequired
};

NavigateButton.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  isCarousel: PropTypes.bool.isRequired
};

ParkingSpotCard.propTypes = {
  spot: PropTypes.shape(spotShape),
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'carousel'])
};

export default ParkingSpotCard;
