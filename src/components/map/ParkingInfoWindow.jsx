import { memo } from 'react';
import PropTypes from 'prop-types';
import { FaCar, FaMotorcycle, FaBiking, FaClock, FaShieldAlt } from 'react-icons/fa';
import { MapPin, X, Info } from 'lucide-react';

const VehicleRateCard = ({ icon: Icon, rate }) => (
  <div className="flex-1 flex flex-col items-center p-2 bg-primary-50/50 rounded-lg border border-primary-100">
    <Icon className="w-4 h-4 text-primary-600 mb-1" />
    <div className="text-center">
      <div className="text-sm font-medium text-primary-900">
        ${rate?.toLocaleString()}
      </div>
      <div className="text-[10px] text-primary-600">por hora</div>
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-2 p-2 bg-gray-50/50 rounded-lg border border-gray-100">
    <Icon className="w-4 h-4 text-primary-500" />
    <div>
      <div className="text-xs font-medium text-gray-900">{title}</div>
      <div className="text-[10px] text-gray-600">{description}</div>
    </div>
  </div>
);

const ParkingInfoWindow = memo(({ spot, onClose }) => {
  if (!spot) return null;

  const isParkiu = !spot.isGooglePlace;

  return (
    <div className="bg-white shadow-lg overflow-hidden">
      {/* Header común con gradiente */}
      <div className="relative p-3 bg-gradient-to-r from-primary-600 to-primary-700">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white mb-0.5">{spot.name}</h3>
            <p className="text-xs text-white/90">{spot.address}</p>
          </div>
        </div>
      </div>

      {/* Contenido condicional */}
      <div className="p-3 space-y-3">
        {isParkiu ? (
          <>
            {/* Tarifas por vehículo */}
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-2">Tarifas por vehículo</h4>
              <div className="grid grid-cols-3 gap-1.5">
                <VehicleRateCard icon={FaCar} rate={spot.carRate} />
                <VehicleRateCard icon={FaMotorcycle} rate={spot.motorcycleRate} />
                <VehicleRateCard icon={FaBiking} rate={spot.bikeRate} />
              </div>
            </div>

            {/* Info adicional */}
            <div className="grid grid-cols-2 gap-1.5">
              <InfoItem
                icon={FaClock}
                title="Horario"
                description={spot.is24h ? 'Abierto 24/7' : spot.operatingHours}
              />
              <InfoItem
                icon={FaShieldAlt}
                title="Seguridad"
                description="Vigilancia 24/7"
              />
            </div>

            {/* Restricciones y notas */}
            {spot.heightRestriction && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                  <span className="text-xs text-amber-700">
                    Altura máxima: {spot.heightRestriction}
                  </span>
                </div>
              </div>
            )}

            {spot.hasFullRate && (
              <div className="p-2 rounded-lg bg-primary-50 border border-primary-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-primary-400" />
                  <span className="text-xs text-primary-700">
                    Disponible tarifa plena para estadías prolongadas
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          // Mensaje informativo para lugares de Google
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-blue-700 font-medium">
                Información proporcionada por Google Maps
              </p>
              <p className="text-[11px] text-blue-600">
                Se recomienda verificar disponibilidad, tarifas y horarios directamente en el establecimiento.
              </p>
              {spot.rating > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="text-yellow-400 text-xs">★</div>
                  <span className="text-xs text-blue-700">{spot.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-blue-600">
                    ({spot.userRatingCount} reseñas)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

VehicleRateCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  rate: PropTypes.number
};

InfoItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

ParkingInfoWindow.displayName = 'ParkingInfoWindow';

ParkingInfoWindow.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    isGooglePlace: PropTypes.bool,
    rating: PropTypes.number,
    userRatingCount: PropTypes.number,
    carRate: PropTypes.number,
    motorcycleRate: PropTypes.number,
    bikeRate: PropTypes.number,
    is24h: PropTypes.bool,
    operatingHours: PropTypes.string,
    heightRestriction: PropTypes.string,
    hasFullRate: PropTypes.bool,
  }),
  onClose: PropTypes.func
};

export default ParkingInfoWindow;
