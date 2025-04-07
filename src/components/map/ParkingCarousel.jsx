import { memo, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import ParkingSpotCard from '../parking/ParkingSpotCard';
import { FaFilter, FaArrowsAltV } from 'react-icons/fa';
import { Badge } from '@/components/common/Badge';

/**
 * ParkingCarousel - Componente para visualización móvil de parqueaderos
 * Muestra los parqueaderos en un carrusel horizontal con filtros
 *
 * @param {Array} parkingSpots - Lista de parqueaderos a mostrar
 * @param {function} onSpotSelect - Función llamada cuando se selecciona un parqueadero
 * @param {string|number} selectedSpotId - ID del parqueadero seleccionado
 * @param {React.RefObject} mapRef - Referencia del mapa
 */
const ParkingCarousel = memo(({ parkingSpots, onSpotSelect, selectedSpotId, mapRef }) => {
  console.log('ParkingCarousel renderizado:', {
    spotsCount: parkingSpots?.length,
    selectedSpotId,
    hasMapRef: !!mapRef?.current
  });

  const [filterAvailable, setFilterAvailable] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(true);

  const filteredSpots = useMemo(() => {
    let spots = [...parkingSpots];

    if (filterAvailable) {
      spots = spots.filter(spot => spot.available_spaces > 0);
    }

    if (sortByDistance) {
      spots.sort((a, b) => a.distance - b.distance);
    }

    return spots;
  }, [parkingSpots, filterAvailable, sortByDistance]);

  const handleSpotSelect = useCallback((spot) => {
    console.log('handleSpotSelect llamado con:', {
      spotId: spot?.id,
      spotName: spot?.name,
      hasMapRef: !!mapRef?.current
    });

    if (!spot || !mapRef?.current) {
      console.warn('Spot o mapRef no válidos:', { spot, hasMapRef: !!mapRef?.current });
      return;
    }

    // Primero actualizamos el estado a través de onSpotSelect
    if (onSpotSelect) {
      console.log('Llamando onSpotSelect con:', spot);
      onSpotSelect(spot);
    }

    // Luego centramos el mapa en el marcador
    const position = {
      lat: parseFloat(spot.latitude),
      lng: parseFloat(spot.longitude)
    };

    console.log('Intentando centrar mapa en:', position);

    if (!isFinite(position.lat) || !isFinite(position.lng)) {
      console.warn('Coordenadas inválidas:', position);
      return;
    }

    // Usamos handleCardClick del mapa para centrar y mostrar el InfoWindow
    try {
      mapRef.current.handleCardClick(spot);
      console.log('handleCardClick ejecutado correctamente');
    } catch (error) {
      console.error('Error al ejecutar handleCardClick:', error);
    }
  }, [onSpotSelect, mapRef]);

  const handleNavigate = useCallback((spot) => {
    if (!spot?.latitude || !spot?.longitude) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`, '_blank');
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header con filtros */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-medium text-gray-900">
                Parqueaderos
              </h2>
              <Badge variant="info" size="small" className="bg-gray-100 text-gray-600">
                {filteredSpots.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSortByDistance(prev => !prev)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  sortByDistance
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={sortByDistance}
                aria-label="Ordenar por distancia"
              >
                <FaArrowsAltV className="w-3 h-3" />
                Distancia
              </button>
              <button
                onClick={() => setFilterAvailable(prev => !prev)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  filterAvailable
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={filterAvailable}
                aria-label="Filtrar disponibles"
              >
                <FaFilter className="w-3 h-3" />
                Disponibles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="flex gap-3 px-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {filteredSpots.map((spot) => (
            <ParkingSpotCard
              key={spot.id}
              spot={spot}
              variant="carousel"
              isSelected={selectedSpotId === spot.id}
              onSelect={handleSpotSelect}
              onNavigate={() => handleNavigate(spot)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

ParkingCarousel.displayName = 'ParkingCarousel';

ParkingCarousel.propTypes = {
  parkingSpots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      available_spaces: PropTypes.number,
      distance: PropTypes.number,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      isGooglePlace: PropTypes.bool,
      price_per_hour: PropTypes.number,
    })
  ).isRequired,
  onSpotSelect: PropTypes.func.isRequired,
  selectedSpotId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  mapRef: PropTypes.object
};

export default ParkingCarousel;
