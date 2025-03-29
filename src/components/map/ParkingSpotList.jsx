import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import ParkingSpotCard from './ParkingSpotCard';

const ParkingSpotList = memo(({ spots, onSpotClick }) => {
  // Memoizar los spots ordenados para evitar recálculos innecesarios
  const sortedSpots = useMemo(() => {
    return [...spots].sort((a, b) => {
      // Primero por distancia si está disponible
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      // Luego por nombre
      return a.name.localeCompare(b.name);
    });
  }, [spots]);

  if (!spots?.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No se encontraron parqueaderos en esta área
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {sortedSpots.map((spot) => (
        <ParkingSpotCard
          key={spot.id}
          spot={spot}
          onClick={() => onSpotClick(spot)}
        />
      ))}
    </div>
  );
});

ParkingSpotList.propTypes = {
  spots: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    distance: PropTypes.number,
    // ... otros props
  })).isRequired,
  onSpotClick: PropTypes.func.isRequired,
};

ParkingSpotList.displayName = 'ParkingSpotList';

export default ParkingSpotList;
