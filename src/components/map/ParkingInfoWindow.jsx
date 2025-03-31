import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Navigation, Star, Clock } from 'lucide-react';

const ParkingInfoWindow = memo(({ spot, onNavigate }) => {
  const parkiuContent = useMemo(() => {
    if (!spot) return null;
    return (
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
        {spot.price_per_hour > 0 && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">Tarifa:</span>
            <span className="font-semibold">
              ${spot.price_per_hour.toLocaleString('es-CO')}/hora
            </span>
          </div>
        )}
      </div>
    );
  }, [spot]);

  const googleContent = useMemo(() => {
    if (!spot) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className={`font-medium ${spot.openNow ? 'text-emerald-600' : 'text-red-600'}`}>
            {spot.openNow ? 'Abierto ahora' : 'Cerrado'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          {spot.rating > 0 && (
            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="font-medium">{spot.rating.toFixed(1)}</span>
              {spot.userRatingCount > 0 && (
                <span className="text-gray-500 text-sm ml-1">
                  ({spot.userRatingCount})
                </span>
              )}
            </div>
          )}
          {spot.formattedDistance && (
            <span className="text-sm text-gray-500">
              A {spot.formattedDistance}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2 italic">
          * Datos proporcionados por Google Places, la información puede ser inexacta.
        </p>
      </div>
    );
  }, [spot]);

  if (!spot) return null;

  const isParkiu = !spot.isGooglePlace;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-bold text-gray-800">{spot.name}</h2>
        {isParkiu ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <img src="/icons/providers/parkiu.svg" alt="Parkiu" width={12} height={12} className="w-3 h-3 mr-1" />
            Parkiu
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <img src="/icons/providers/google.svg" alt="Google" width={12} height={12} className="w-3 h-3 mr-1" />
            Google Places
          </span>
        )}
      </div>

      <p className="text-gray-600 mb-3 flex items-start">
        <svg className="inline w-4 h-4 mr-1 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="flex-1">{spot.address}</span>
      </p>

      {isParkiu ? parkiuContent : googleContent}

      <button
        onClick={onNavigate}
        className="w-full mt-4 bg-primary hover:bg-primary-600 text-white flex gap-2 items-center justify-center py-2 px-3 transition-all shadow-md hover:shadow-lg rounded-lg text-sm"
      >
        <Navigation className="w-4 h-4 animate-pulse" />
        <span>Navegar</span>
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimizar re-renders comparando solo las propiedades necesarias
  return prevProps.spot?.id === nextProps.spot?.id &&
         prevProps.spot?.available_spaces === nextProps.spot?.available_spaces &&
         prevProps.spot?.name === nextProps.spot?.name &&
         prevProps.spot?.address === nextProps.spot?.address &&
         prevProps.spot?.openNow === nextProps.spot?.openNow &&
         prevProps.spot?.rating === nextProps.spot?.rating &&
         prevProps.spot?.price_per_hour === nextProps.spot?.price_per_hour;
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
    isGooglePlace: PropTypes.bool,
    available_spaces: PropTypes.number,
    total_spaces: PropTypes.number,
    price_per_hour: PropTypes.number,
    rating: PropTypes.number,
    userRatingCount: PropTypes.number,
    openNow: PropTypes.bool,
    businessStatus: PropTypes.string,
    formattedDistance: PropTypes.string,
  }),
  onNavigate: PropTypes.func.isRequired
};

export default ParkingInfoWindow;
