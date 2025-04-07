import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import ParkingSpotCard from './ParkingSpotCard';
import { Badge } from '@/components/common/Badge';

/**
 * ParkingSpotList - Componente para visualización desktop de parqueaderos
 * Muestra los parqueaderos en una lista vertical
 *
 * @param {Array} parkingSpots - Lista de parqueaderos a mostrar
 * @param {function} onSpotSelect - Función llamada cuando se selecciona un parqueadero
 * @param {Object} selectedSpot - Parqueadero seleccionado actualmente
 */
const ParkingSpotList = memo(({ parkingSpots, onSpotSelect, selectedSpot }) => {
  // Memoizar los spots ordenados para evitar recálculos innecesarios
  const sortedSpots = useMemo(() => {
    return [...parkingSpots].sort((a, b) => {
      // Primero por distancia si está disponible
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      // Luego por nombre
      return a.name.localeCompare(b.name);
    });
  }, [parkingSpots]);

  if (!parkingSpots?.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No se encontraron parqueaderos en esta área
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">
            Parqueaderos cercanos
          </h2>
          <Badge variant="info" className="bg-gray-100 text-gray-600">
            {sortedSpots.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {sortedSpots.map((spot) => (
            <ParkingSpotCard
              key={spot.id}
              spot={spot}
              variant="default"
              isSelected={selectedSpot?.id === spot.id}
              onSelect={() => onSpotSelect(spot)}
              onNavigate={() => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`, '_blank');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

ParkingSpotList.displayName = 'ParkingSpotList';

ParkingSpotList.propTypes = {
  parkingSpots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      distance: PropTypes.number,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    })
  ).isRequired,
  onSpotSelect: PropTypes.func.isRequired,
  selectedSpot: PropTypes.object,
};

export default ParkingSpotList;
