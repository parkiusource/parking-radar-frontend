import { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ParkingSpotCard from './ParkingSpotCard';
import { FaFilter, FaArrowsAltV, FaDollarSign } from 'react-icons/fa';

const ParkingCarousel = memo(({ parkingSpots, onSelect }) => {
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(true);
  const [priceRange, setPriceRange] = useState('all');

  const filteredSpots = useMemo(() => {
    let spots = [...parkingSpots];

    // Filtro por disponibilidad
    if (filterAvailable) {
      spots = spots.filter(spot => spot.available_spaces > 0);
    }

    // Filtro por precio
    if (priceRange !== 'all') {
      spots = spots.filter(spot => {
        const price = spot.price_per_hour || 0;
        switch (priceRange) {
          case 'low': return price <= 5000;
          case 'medium': return price > 5000 && price <= 8000;
          case 'high': return price > 8000;
          default: return true;
        }
      });
    }

    // Ordenar por distancia
    if (sortByDistance) {
      spots.sort((a, b) => a.distance - b.distance);
    }

    return spots;
  }, [parkingSpots, filterAvailable, sortByDistance, priceRange]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with backdrop */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2">
          {/* Título y filtros en una sola fila */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-gray-900">
                Parqueaderos cercanos
              </h2>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {filteredSpots.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortByDistance(prev => !prev)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  sortByDistance
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaArrowsAltV className="w-3 h-3" />
                <span>Distancia</span>
              </button>
              <button
                onClick={() => setFilterAvailable(prev => !prev)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  filterAvailable
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter className="w-3 h-3" />
                <span>Disponibles</span>
              </button>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex gap-1">
                <button
                  onClick={() => setPriceRange('all')}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                    priceRange === 'all'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaDollarSign className="w-3 h-3" />
                  <span>Todos</span>
                </button>
                <button
                  onClick={() => setPriceRange('low')}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    priceRange === 'low'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {'< $5K'}
                </button>
                <button
                  onClick={() => setPriceRange('medium')}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    priceRange === 'medium'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  $5K - $8K
                </button>
                <button
                  onClick={() => setPriceRange('high')}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    priceRange === 'high'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {'> $8K'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel section */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="flex h-full gap-3 px-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              className="flex-shrink-0 w-[320px] h-full snap-start"
            >
              <div className="h-full">
                <ParkingSpotCard
                  parking={spot}
                  onClick={() => onSelect(spot)}
                  className="h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación profunda de parkingSpots
  const spotsEqual = prevProps.parkingSpots?.length === nextProps.parkingSpots?.length &&
    prevProps.parkingSpots?.every((spot, index) =>
      spot.id === nextProps.parkingSpots[index].id &&
      spot.available_spaces === nextProps.parkingSpots[index].available_spaces
    );

  return spotsEqual && prevProps.onSelect === nextProps.onSelect;
});

ParkingCarousel.displayName = 'ParkingCarousel';

ParkingCarousel.propTypes = {
  parkingSpots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      available_spaces: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      distance: PropTypes.number.isRequired,
      price_per_hour: PropTypes.number,
      price_per_minute: PropTypes.number,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      isGooglePlace: PropTypes.bool,
      businessStatus: PropTypes.string,
      rating: PropTypes.number,
      userRatingCount: PropTypes.number,
      carSpaces: PropTypes.number,
      motorcycleSpaces: PropTypes.number,
      bikeSpaces: PropTypes.number,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ParkingCarousel;
