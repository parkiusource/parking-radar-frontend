import { memo, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaFilter, FaArrowsAltV, FaDollarSign } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ParkingSpotCard from './ParkingSpotCard';

const ParkingCarousel = memo(({ parkingSpots, onSelect }) => {
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(true);
  const [filterPrice, setFilterPrice] = useState('all'); // 'all', 'low', 'medium', 'high'

  // Memoizar los handlers de los filtros
  const handleSortByDistance = useCallback(() => {
    setSortByDistance(prev => !prev);
  }, []);

  const handleFilterAvailable = useCallback(() => {
    setFilterAvailable(prev => !prev);
  }, []);

  const handleFilterPrice = useCallback((price) => {
    setFilterPrice(price);
  }, []);

  // Memoizar el filtrado y ordenamiento
  const filteredAndSortedSpots = useMemo(() => {
    let spots = parkingSpots;

    // Filtro por disponibilidad
    if (filterAvailable) {
      spots = spots.filter(spot => spot.available_spaces > 0);
    }

    // Filtro por precio
    if (filterPrice !== 'all') {
      spots = spots.filter(spot => {
        const price = spot.price_per_hour || 0;
        switch (filterPrice) {
          case 'low':
            return price <= 70;
          case 'medium':
            return price > 70 && price <= 90;
          case 'high':
            return price > 90;
          default:
            return true;
        }
      });
    }

    // Ordenar por distancia
    if (sortByDistance) {
      spots = [...spots].sort((a, b) => a.distance - b.distance);
    }

    return spots;
  }, [parkingSpots, filterAvailable, sortByDistance, filterPrice]);

  // Memoizar el renderizado de las cards
  const renderCards = useMemo(() => {
    return filteredAndSortedSpots.map((spot, index) => (
      <ParkingSpotCard
        key={`${spot.id}-${index}`}
        parking={spot}
        onClick={() => onSelect(spot)}
        index={index}
        variant="mobile"
      />
    ));
  }, [filteredAndSortedSpots, onSelect]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-t border-gray-100 md:hidden h-full"
    >
      {/* Header reorganizado */}
      <div className="flex flex-col px-3 pt-2 pb-1.5 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-gray-900">Parqueaderos cercanos</h2>
            <span className="px-1.5 py-0.5 bg-gray-100 text-xs font-medium text-gray-600 rounded">
              {filteredAndSortedSpots.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSortByDistance}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                sortByDistance
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaArrowsAltV className="w-3 h-3" />
              <span>Distancia</span>
            </button>
            <button
              onClick={handleFilterAvailable}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                filterAvailable
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter className="w-3 h-3" />
              <span>Disponibles</span>
            </button>
          </div>
        </div>

        {/* Filtros de precio en una sola línea */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleFilterPrice('all')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
              filterPrice === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaDollarSign className="w-3 h-3" />
            <span>Todos</span>
          </button>
          <div className="h-3 w-px bg-gray-200 mx-1" />
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleFilterPrice('low')}
              className={`flex items-center px-2 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
                filterPrice === 'low'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Hasta $70</span>
            </button>
            <button
              onClick={() => handleFilterPrice('medium')}
              className={`flex items-center px-2 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
                filterPrice === 'medium'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>$70 - $90</span>
            </button>
            <button
              onClick={() => handleFilterPrice('high')}
              className={`flex items-center px-2 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
                filterPrice === 'high'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Más de $90</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carrusel con cards */}
      <div className="overflow-x-auto scrollbar-hide flex-1 bg-gray-50">
        <div className="flex px-4 py-4 gap-4 snap-x snap-mandatory h-full">
          {renderCards}
        </div>
      </div>
    </motion.div>
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
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ParkingCarousel;
