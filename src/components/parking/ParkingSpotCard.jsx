import { memo, useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaMotorcycle, FaBiking } from 'react-icons/fa';
import { MapPin, DollarSign, Car, Shield, Navigation, Clock } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

/**
 * ParkingSpotCard - Componente unificado para mostrar información de un parqueadero
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.spot - Datos del parqueadero
 * @param {boolean} props.isSelected - Si el parqueadero está seleccionado
 * @param {function} props.onSelect - Función para seleccionar el parqueadero
 * @param {function} props.onNavigate - Función para navegar al parqueadero (opcional)
 * @param {string} props.variant - Variante de visualización ('default', 'carousel', 'expanded')
 * @param {number} props.index - Índice del parqueadero en la lista (opcional)
 */
const ParkingSpotCard = memo(({
  spot,
  isSelected,
  onSelect,
  onNavigate,
  variant = 'default',
  index
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isParkiu = !spot.isGooglePlace;
  const isCarousel = variant === 'carousel';

  const handleNavigateClick = useCallback((e) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate();
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`, '_blank');
    }
  }, [onNavigate, spot.latitude, spot.longitude]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(spot);
  }, [spot, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(spot);
    }
  }, [spot, onSelect]);

  const handleNavigateKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigateClick(e);
    }
  }, [handleNavigateClick]);

  const handleExpandKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(prev => !prev);
    }
  }, []);

  const getStatusBadge = useCallback(() => {
    if (isParkiu) {
      return spot.available_spaces > 0
        ? <Badge variant="success" size="small" className="bg-green-50 text-green-700 border-green-200">Disponible</Badge>
        : <Badge variant="error" size="small" className="bg-red-50 text-red-700 border-red-200">Lleno</Badge>;
    }

    return (spot.businessStatus === 'OPERATIONAL' || spot.openNow)
      ? <Badge variant="success" size="small" className="bg-blue-50 text-blue-700 border-blue-200">Abierto</Badge>
      : <Badge variant="error" size="small" className="bg-gray-50 text-gray-700 border-gray-200">Cerrado</Badge>;
  }, [isParkiu, spot.available_spaces, spot.businessStatus, spot.openNow]);

  const distanceText = useMemo(() => {
    if (spot.distance == null) return null;
    return spot.distance < 1000
      ? `${Math.round(spot.distance)}m`
      : `${(spot.distance / 1000).toFixed(1)}km`;
  }, [spot.distance]);

  return (
    <div
      className={`
        bg-white rounded-lg border transition-all cursor-pointer
        ${isCarousel ? 'w-[300px] flex-none snap-start' : 'w-full'}
        ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md border-gray-200'}
        ${isCarousel ? 'p-3 sm:p-4' : 'p-3 sm:p-4'}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="relative">
        {/* Top accent bar */}
        <div className={`w-full h-1 ${isParkiu ? 'bg-primary' : 'bg-gray-200'}`} />

        <div className="p-3 sm:p-4">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1">
                  {spot.name}
                </h3>
                {index === 0 && variant !== 'carousel' && (
                  <Badge variant="primary" className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1.5 hidden sm:inline-flex">
                    Más cercano
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-500 line-clamp-1">
                  {spot.address}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 sm:gap-1.5">
              {getStatusBadge()}
              {isParkiu ? (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                  <img src="/icons/providers/parkiu.svg" alt="Parkiu" className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Parkiu
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  <img src="/icons/providers/google.svg" alt="Google" className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Google
                </span>
              )}
            </div>
          </div>

          {/* Main Content */}
          {isParkiu ? (
            <>
              {/* Availability and Price Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex items-center p-2 sm:p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                  <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {spot.available_spaces} disponibles
                  </span>
                </div>
                {spot.price_per_hour > 0 && (
                  <div className="flex items-center p-2 sm:p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      Desde ${spot.price_per_hour?.toLocaleString()}/h
                    </span>
                  </div>
                )}
              </div>

              {variant === 'expanded' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  onKeyDown={handleExpandKeyDown}
                  className="w-full flex items-center justify-center text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors py-1 sm:py-1.5 border border-primary/20 rounded-lg hover:bg-primary/5"
                >
                  {isExpanded ? "Ocultar detalles ▲" : "Ver detalles ▼"}
                </button>
              )}

              {variant === 'expanded' && isExpanded && (
                <div className="mt-3 space-y-4">
                  {/* Tarifas por tipo de vehículo */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Tarifas por tipo de vehículo</h4>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {/* Carro */}
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <Car className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mb-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                            ${spot.carRate?.toLocaleString()}/h
                          </span>
                          {spot.price_per_minute > 0 && (
                            <span className="text-[8px] sm:text-[10px] text-gray-500">
                              ${spot.price_per_minute}/min
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Moto */}
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <FaMotorcycle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mb-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                            ${spot.motorcycleRate?.toLocaleString()}/h
                          </span>
                          {spot.price_per_minute > 0 && (
                            <span className="text-[8px] sm:text-[10px] text-gray-500">
                              ${Math.round(spot.price_per_minute * 0.7)}/min
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Bicicleta */}
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <FaBiking className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mb-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                            ${spot.bikeRate?.toLocaleString()}/h
                          </span>
                          {spot.price_per_minute > 0 && (
                            <span className="text-[8px] sm:text-[10px] text-gray-500">
                              ${Math.round(spot.price_per_minute * 0.5)}/min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 sm:p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                          <span className="text-[10px] sm:text-xs font-medium text-gray-900">Horario</span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          {spot.is24h ? 'Abierto 24/7' : spot.operatingHours}
                        </span>
                      </div>
                      {spot.has_security && (
                        <div className="p-2 sm:p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-900">Seguridad</span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-600">Vigilancia 24/7</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Google Places Content */
            <div className="space-y-3">
              {spot.rating > 0 && (
                <div className="flex items-center p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-yellow-400 mr-2 text-lg">★</span>
                  <span className="text-sm font-medium text-gray-900">{spot.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-600 ml-1">({spot.user_ratings_total} reseñas)</span>
                </div>
              )}
            </div>
          )}

          {/* Distance and Navigation */}
          <div className="flex items-center justify-between mt-3">
            {distanceText && (
              <span className="text-sm text-gray-500">
                A {distanceText}
              </span>
            )}
            <button
              onClick={handleNavigateClick}
              onKeyDown={handleNavigateKeyDown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-colors"
              aria-label="Navegar al parqueadero"
            >
              <Navigation className="w-4 h-4" />
              Navegar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ParkingSpotCard.displayName = 'ParkingSpotCard';

ParkingSpotCard.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    isGooglePlace: PropTypes.bool,
    available_spaces: PropTypes.number,
    price_per_hour: PropTypes.number,
    price_per_minute: PropTypes.number,
    distance: PropTypes.number,
    rating: PropTypes.number,
    user_ratings_total: PropTypes.number,
    businessStatus: PropTypes.string,
    openNow: PropTypes.bool,
    carRate: PropTypes.number,
    motorcycleRate: PropTypes.number,
    bikeRate: PropTypes.number,
    is24h: PropTypes.bool,
    operatingHours: PropTypes.string,
    has_security: PropTypes.bool,
    hasFullRate: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onNavigate: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'carousel', 'expanded']),
  index: PropTypes.number,
};

export default ParkingSpotCard;
