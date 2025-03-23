import { memo } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Car, DollarSign, Navigation } from 'lucide-react';

const ParkingInfoWindow = memo(({ spot, onNavigate }) => {
  if (!spot) return null;

  const isParkiu = !spot.isGooglePlace;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-bold text-gray-800">{spot.name}</h2>
        {isParkiu ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Parkiu
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Google Places
          </span>
        )}
      </div>

      <p className="text-gray-600 mb-3">
        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {spot.address}
      </p>

      {isParkiu ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">Espacios disponibles:</span>
            <span className="font-semibold text-lg">
              {spot.available_spaces}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">Estado:</span>
            <span className={`font-medium ${spot.available_spaces > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {spot.available_spaces > 0 ? 'Disponible' : 'Lleno'}
            </span>
          </div>
          {spot.price && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Tarifa:</span>
              <span className="font-semibold">${spot.price}/hora</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">Estado:</span>
            <span className={`font-medium ${spot.businessStatus === 'OPERATIONAL' ? 'text-emerald-600' : 'text-red-600'}`}>
              {spot.businessStatus === 'OPERATIONAL' ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
          {spot.rating && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Calificación:</span>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="font-semibold">{spot.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm ml-1">({spot.userRatingCount})</span>
              </div>
            </div>
          )}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-blue-800 font-medium mb-2">¿Eres el administrador?</h3>
            <p className="text-sm text-blue-600 mb-3">
              Únete a Parkiu y gestiona tu parqueadero en tiempo real. Aumenta tus ingresos y mejora la experiencia de tus clientes.
            </p>
            <button
              onClick={() => window.open('https://parkiu.com/register', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              Registrar mi parqueadero
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onNavigate}
        className="w-full bg-primary hover:bg-primary-600 text-white flex gap-2 items-center justify-center py-2 px-3 transition-all shadow-md hover:shadow-lg rounded-lg text-sm"
      >
        <Navigation className="w-4 h-4 animate-pulse" />
        <span>Navegar</span>
      </button>
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
