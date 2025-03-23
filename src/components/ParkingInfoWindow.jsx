import { memo } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Car, DollarSign, Navigation } from 'lucide-react';

const ParkingInfoWindow = memo(({ spot, onNavigate }) => {
  if (!spot) return null;

  return (
    <div className="p-3 font-sans rounded-lg overflow-hidden animate-fadeIn">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">{spot.name}</h3>
      </div>

      <div className="flex items-start gap-2 mb-2">
        <MapPin className="text-primary mt-1 flex-shrink-0 w-4 h-4" />
        <p className="text-gray-700 text-sm">{spot.address}</p>
      </div>

      <div className={`mb-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
        spot.available_spaces > 0
          ? 'bg-green-50 text-green-800'
          : 'bg-red-50 text-red-800'
      }`}>
        <Car className={`w-4 h-4 ${
          spot.available_spaces > 0 ? 'text-green-600' : 'text-red-600'
        }`} />
        <p className="text-sm">
          {spot.available_spaces > 0
            ? `${spot.available_spaces} espacios disponibles`
            : 'Sin espacios disponibles'}
        </p>
      </div>

      <div className="mb-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800">
        <DollarSign className="w-4 h-4 text-blue-600" />
        <p className="text-sm">
          $60 a $100/min
        </p>
      </div>

      {spot.available_spaces > 0 ? (
        <button
          className="w-full bg-primary hover:bg-primary-600 text-white flex gap-2 items-center justify-center py-2 px-3 transition-all shadow-md hover:shadow-lg rounded-lg text-sm"
          onClick={onNavigate}
        >
          <Navigation className="w-4 h-4 animate-pulse" />
          <span>Navegar</span>
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-sm text-gray-700 font-medium">
            Este parqueadero está lleno
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Intenta buscar otro parqueadero cercano
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.spot?.id === nextProps.spot?.id &&
         prevProps.spot?.available_spaces === nextProps.spot?.available_spaces &&
         prevProps.spot?.name === nextProps.spot?.name &&
         prevProps.spot?.address === nextProps.spot?.address;
});

ParkingInfoWindow.displayName = 'ParkingInfoWindow';

ParkingInfoWindow.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    available_spaces: PropTypes.number.isRequired,
    total_spaces: PropTypes.number.isRequired,
  }),
  onNavigate: PropTypes.func.isRequired
};

export default ParkingInfoWindow;
