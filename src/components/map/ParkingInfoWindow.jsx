import { memo } from 'react';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react';

const ParkingInfoWindow = memo(({ spot }) => {
  if (!spot) return null;

  const isParkiu = !spot.isGooglePlace;

  return (
    <div className="bg-white rounded-lg shadow-lg p-2.5 max-w-[240px] mx-auto">
      {/* Encabezado con nombre y badge de proveedor */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-center gap-1.5">
          {isParkiu ? (
            <div className="relative group">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <img src="/icons/providers/parkiu.svg" alt="Parkiu" width={12} height={12} className="w-3 h-3 mr-1" />
                Parkiu
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                Información en tiempo real proporcionada por sensores Parkiu
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <img src="/icons/providers/google.svg" alt="Google" width={12} height={12} className="w-3 h-3 mr-1" />
                Google Places
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                Información proporcionada por Google Maps
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>
          )}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Información sobre la fuente de datos"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        <h2 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 text-center">{spot.name}</h2>
        {spot.formattedDistance && (
          <span className="text-xs text-gray-500 text-center">
            A {spot.formattedDistance}
          </span>
        )}
      </div>

      {/* Estado y disponibilidad */}
      {isParkiu ? (
        <div className="flex flex-col items-center gap-1.5 mt-2">
          {/* Disponibilidad */}
          <div className="flex items-center justify-center gap-2 w-full">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              spot.available_spaces > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {spot.available_spaces > 0 ? `${spot.available_spaces} disponibles` : 'Lleno'}
            </span>
            {spot.price_per_hour > 0 && (
              <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                ${spot.price_per_hour.toLocaleString('es-CO')}/h
              </span>
            )}
          </div>

          {/* Información adicional de Parkiu */}
          {spot.total_spaces > 0 && (
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
              Capacidad total: {spot.total_spaces} espacios
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center mt-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            spot.openNow ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {spot.openNow ? 'Abierto ahora' : 'Cerrado'}
          </span>
        </div>
      )}
    </div>
  );
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
    openNow: PropTypes.bool,
    formattedDistance: PropTypes.string,
  })
};

export default ParkingInfoWindow;
