import { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ParkingSpotCard from './ParkingSpotCard';
import { FaFilter, FaArrowsAltV } from 'react-icons/fa';

const ParkingCarousel = memo(({ parkingSpots, onSelect, selectedSpotId }) => {
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
        <div className="px-3 py-1.5">
          {/* Título y filtros en una sola fila */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-medium text-gray-900">
                Parqueaderos
              </h2>
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {filteredSpots.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSortByDistance(prev => !prev)}
                className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full transition-colors ${
                  sortByDistance
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaArrowsAltV className="w-2.5 h-2.5" />
                <span>Distancia</span>
              </button>
              <button
                onClick={() => setFilterAvailable(prev => !prev)}
                className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full transition-colors ${
                  filterAvailable
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter className="w-2.5 h-2.5" />
                <span>Disponibles</span>
              </button>
              <div className="h-4 w-px bg-gray-200" />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="text-xs bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5 border-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="all">Precio: Todos</option>
                <option value="low">{'< $5K'}</option>
                <option value="medium">$5K - $8K</option>
                <option value="high">{'> $8K'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel section */}
      <div className="flex-1 overflow-y-auto py-1.5">
        <div className="flex h-full gap-2 px-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {filteredSpots.map((spot) => (
            <ParkingSpotCard
              key={spot.id}
              spot={spot}
              variant="carousel"
              isSelected={selectedSpotId === spot.id}
              onSelect={() => onSelect(spot)}
              onNavigate={() => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`, '_blank');
              }}
            />
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

  return spotsEqual &&
         prevProps.onSelect === nextProps.onSelect &&
         prevProps.selectedSpotId === nextProps.selectedSpotId;
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
  selectedSpotId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ParkingCarousel;
