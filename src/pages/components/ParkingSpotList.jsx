import PropTypes from 'prop-types';
import { LuMapPin, LuCar, LuStar, LuDollarSign } from 'react-icons/lu';

export function ParkingSpotList({ spots, selectedSpot, onSpotSelect }) {
  if (!spots.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <LuMapPin className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">No hay parqueaderos cercanos</p>
        <p className="text-sm">Intenta buscar en otra ubicación</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {spots.map((spot) => (
        <button
          key={spot.id}
          onClick={() => onSpotSelect({ spot })}
          className={`w-full p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
            selectedSpot?.id === spot.id ? 'bg-primary/5' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{spot.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{spot.address}</p>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <LuCar className="w-4 h-4 mr-1" />
                  <span>{spot.available_spaces} disponibles</span>
                </div>

                {spot.rating && (
                  <div className="flex items-center text-gray-600">
                    <LuStar className="w-4 h-4 mr-1 text-yellow-400" />
                    <span>{spot.rating.toFixed(1)}</span>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <LuDollarSign className="w-4 h-4 mr-1" />
                  <span>Desde ${spot.min_price.toLocaleString()}/h</span>
                </div>
              </div>
            </div>

            <div className="text-sm font-medium text-gray-900">
              {spot.formattedDistance} km
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

ParkingSpotList.propTypes = {
  spots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      available_spaces: PropTypes.number.isRequired,
      rating: PropTypes.number,
      min_price: PropTypes.number.isRequired,
      formattedDistance: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedSpot: PropTypes.object,
  onSpotSelect: PropTypes.func.isRequired,
};
