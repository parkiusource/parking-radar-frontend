import { memo, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { LuCar, LuMapPin, LuClock, LuFilter, LuArrowUpDown, LuDollarSign } from 'react-icons/lu';
import { motion } from 'framer-motion';

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

  // Memoizar el formateo de distancia
  const formatDistance = useCallback((meters) => {
    return meters < 1000
      ? `${Math.round(meters)}m`
      : `${(meters / 1000).toFixed(1)}km`;
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
        const minPrice = spot.min_price || 0;
        const maxPrice = spot.max_price || minPrice;
        const avgPrice = (minPrice + maxPrice) / 2;
        switch (filterPrice) {
          case 'low':
            return avgPrice <= 70;
          case 'medium':
            return avgPrice > 70 && avgPrice <= 90;
          case 'high':
            return avgPrice > 90;
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
      <motion.div
        key={`${spot.id}-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="flex-none w-[260px] snap-center"
        onClick={() => onSelect(spot)}
      >
        <div className="bg-white h-[165px] border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="flex justify-between items-start gap-1 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">
              {spot.name}
            </h3>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
              typeof spot.available_spaces === 'number' && spot.available_spaces > 0
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {typeof spot.available_spaces === 'number' && spot.available_spaces > 0 ? 'Disponible' : 'Lleno'}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600 text-xs mb-3">
            <div className="flex items-center flex-1 min-w-0">
              <LuMapPin className="mr-1.5 flex-shrink-0 text-gray-400 w-3.5 h-3.5" />
              <span className="line-clamp-2">{spot.address}</span>
            </div>
            <span className="text-xs text-primary font-medium ml-2 whitespace-nowrap">
              {formatDistance(spot.distance)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="flex items-center text-gray-700 text-xs bg-gray-50 px-2.5 py-2 rounded">
              <LuCar className="mr-1.5 text-primary w-3.5 h-3.5" />
              <span>{typeof spot.available_spaces === 'number' ? spot.available_spaces : '?'} espacios</span>
            </div>
            <div className="flex items-center text-gray-700 text-xs bg-gray-50 px-2.5 py-2 rounded">
              <LuClock className="mr-1.5 text-primary w-3.5 h-3.5" />
              <span className="font-medium">
                ${spot.min_price || 0}
                {spot.max_price ? ` - $${spot.max_price}` : ''}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    ));
  }, [filteredAndSortedSpots, onSelect, formatDistance]);

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
              <LuArrowUpDown className="w-3 h-3" />
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
              <LuFilter className="w-3 h-3" />
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
            <LuDollarSign className="w-3 h-3" />
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
        <div className="flex px-2 py-2 gap-2 snap-x snap-mandatory h-full pb-1">
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
      min_price: PropTypes.number,
      max_price: PropTypes.number,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ParkingCarousel;
