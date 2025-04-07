import { memo } from 'react';
import PropTypes from 'prop-types';
import { Navigation, MapPin } from 'lucide-react';

/**
 * ProviderBadge - Muestra el badge del proveedor (Parkiu o Google)
 */
const ProviderBadge = ({ isParkiu }) => (
  isParkiu ? (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 flex-shrink-0">
      <img src="/icons/providers/parkiu.svg" alt="Parkiu" width={14} height={14} className="w-3.5 h-3.5 mr-1.5" />
      Parkiu
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
      <img src="/icons/providers/google.svg" alt="Google" width={14} height={14} className="w-3.5 h-3.5 mr-1.5" />
      Google
    </span>
  )
);

/**
 * ParkingSpotCard - Componente base para mostrar información de un parqueadero
 *
 * @param {Object} spot - Datos del parqueadero
 * @param {boolean} isSelected - Si el parqueadero está seleccionado
 * @param {function} onSelect - Función para seleccionar el parqueadero
 * @param {function} onNavigate - Función para navegar al parqueadero
 * @param {string} variant - Variante de visualización ('default' para lista, 'carousel' para móvil)
 */
const ParkingSpotCard = memo(({ spot, isSelected, onSelect, onNavigate, variant = 'default' }) => {
  if (!spot) return null;

  const isParkiu = !spot.isGooglePlace;
  const isCarousel = variant === 'carousel';

  const handleNavigateClick = (e) => {
    e.stopPropagation();
    onNavigate();
  };

  return (
    <div
      className={`
        bg-white rounded-lg border transition-all cursor-pointer
        ${isCarousel ? 'w-[300px] flex-none snap-start' : 'w-full'}
        ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md border-gray-200'}
        ${isCarousel ? 'p-3 sm:p-4' : 'p-3 sm:p-4'}
      `}
      onClick={onSelect}
      role="button"
      aria-pressed={isSelected}
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-medium text-gray-900 line-clamp-1 mb-1">
              {spot.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-500 line-clamp-1">
                {spot.address}
              </p>
            </div>
          </div>
          <ProviderBadge isParkiu={isParkiu} />
        </div>

        {/* Status and Price */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium px-3 py-1 rounded-full flex-shrink-0 ${
            isParkiu ? (
              spot.available_spaces > 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            ) : (
              'bg-blue-50 text-blue-700 border border-blue-200'
            )
          }`}>
            {isParkiu
              ? (spot.available_spaces > 0 ? `${spot.available_spaces} disponibles` : 'Lleno')
              : (spot.openNow ? 'Abierto' : 'Cerrado')
            }
          </span>
          {spot.price_per_hour > 0 && (
            <span className="text-sm font-medium bg-gray-50 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
              ${spot.price_per_hour.toLocaleString()}/h
            </span>
          )}
        </div>

        {/* Distance and Navigation */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-gray-500">
            A {spot.formattedDistance || `${spot.distance?.toFixed(1)}m`}
          </span>
          <button
            onClick={handleNavigateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-colors"
            aria-label="Navegar al parqueadero"
          >
            <Navigation className="w-4 h-4" />
            Navegar
          </button>
        </div>
      </div>
    </div>
  );
});

ParkingSpotCard.displayName = 'ParkingSpotCard';

// PropTypes definitions
ProviderBadge.propTypes = {
  isParkiu: PropTypes.bool.isRequired
};

ParkingSpotCard.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    isGooglePlace: PropTypes.bool,
    available_spaces: PropTypes.number,
    price_per_hour: PropTypes.number,
    distance: PropTypes.number,
    formattedDistance: PropTypes.string,
    openNow: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'carousel'])
};

export default ParkingSpotCard;
