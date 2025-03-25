import { useMemo } from 'react';
import {
  validateCoordinates,
  removeDuplicateSpots,
  calculateDistances,
  filterByRadius,
  sortByDistance
} from '@/utils/searchUtils';

/**
 * Hook para encontrar parqueaderos cercanos
 * @param {Object} params - Parámetros de búsqueda
 * @param {Array} params.spots - Lista de parqueaderos
 * @param {Object} params.center - Punto central {lat, lng}
 * @param {number} params.limit - Límite de resultados
 * @param {number} params.maxRadius - Radio máximo en metros
 * @returns {Object} Lista de parqueaderos cercanos
 */
export const useNearbyParkingSpots = ({ spots = [], center, limit = 5, maxRadius = Infinity }) => {
  const nearbySpots = useMemo(() => {
    if (!Array.isArray(spots)) return [];

    if (!validateCoordinates(center)) {
      return spots.slice(0, limit);
    }

    // Proceso de búsqueda en pasos:
    // 1. Eliminar duplicados
    const uniqueSpots = removeDuplicateSpots(spots);

    // 2. Calcular distancias
    const spotsWithDistance = calculateDistances(uniqueSpots, center);

    // 3. Filtrar por radio
    const filteredSpots = filterByRadius(spotsWithDistance, maxRadius);

    // 4. Ordenar por distancia
    const sortedSpots = sortByDistance(filteredSpots);

    // 5. Limitar resultados
    return sortedSpots.slice(0, limit);
  }, [spots, center, limit, maxRadius]);

  return { nearbySpots };
};

export default useNearbyParkingSpots;
