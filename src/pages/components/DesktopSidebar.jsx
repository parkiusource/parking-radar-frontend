import PropTypes from 'prop-types';
import { ParkingSpotList } from './ParkingSpotList';

export function DesktopSidebar({
  spots,
  selectedSpot,
  sortBy,
  onSortChange,
  onSpotSelect
}) {
  return (
    <aside className="hidden md:flex md:flex-col h-[calc(100vh-4rem)] bg-white shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Parqueaderos cercanos</h2>
        <div className="mt-2">
          <label htmlFor="sortBy" className="block text-sm text-gray-600">Ordenar por:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="distance">Distancia</option>
            <option value="price">Precio</option>
            <option value="rating">Calificación</option>
            <option value="availability">Disponibilidad</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto parking-list">
        <ParkingSpotList
          spots={spots}
          selectedSpot={selectedSpot}
          onSpotSelect={onSpotSelect}
        />
      </div>
    </aside>
  );
}

DesktopSidebar.propTypes = {
  spots: PropTypes.array.isRequired,
  selectedSpot: PropTypes.object,
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onSpotSelect: PropTypes.func.isRequired,
};
