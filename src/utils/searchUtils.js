/**
 * Utilidades para búsqueda y cálculo de distancias
 */

// Constantes
const EARTH_RADIUS = 6371e3; // Radio de la Tierra en metros

/**
 * Convierte grados a radianes
 * @param {number} value - Valor en grados
 * @returns {number} Valor en radianes
 */
const toRad = (value) => (value * Math.PI) / 180;

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param {Object} coords1 - Primera coordenada {lat, lng}
 * @param {Object} coords2 - Segunda coordenada {lat, lng}
 * @returns {number} Distancia en metros
 */
export const haversineDistance = (coords1, coords2) => {
  const lat1 = coords1?.lat ?? 0;
  const lng1 = coords1?.lng ?? 0;
  const lat2 = coords2?.lat ?? 0;
  const lng2 = coords2?.lng ?? 0;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
};

/**
 * Valida que las coordenadas sean números finitos
 * @param {Object} coords - Coordenadas a validar {lat, lng}
 * @returns {boolean} true si las coordenadas son válidas
 */
export const validateCoordinates = (coords) =>
  Number.isFinite(coords?.lat) && Number.isFinite(coords?.lng);

/**
 * Elimina parqueaderos duplicados basados en ID o coordenadas
 * @param {Array} spots - Lista de parqueaderos
 * @returns {Array} Lista de parqueaderos únicos
 */
export const removeDuplicateSpots = (spots) => {
  return spots.filter((spot, index, self) =>
    index === self.findIndex((s) => (
      s.id === spot.id ||
      (Math.abs(s.latitude - spot.latitude) < 0.0005 &&
       Math.abs(s.longitude - spot.longitude) < 0.0005)
    ))
  );
};

/**
 * Calcula las distancias de todos los parqueaderos desde un punto central
 * @param {Array} spots - Lista de parqueaderos
 * @param {Object} center - Punto central {lat, lng}
 * @returns {Array} Lista de parqueaderos con sus distancias
 */
export const calculateDistances = (spots, center) => {
  return spots.map((spot) => {
    const spotCoordinates = { lat: spot.latitude, lng: spot.longitude };
    const distance = haversineDistance(center, spotCoordinates);
    return {
      ...spot,
      distance,
      formattedDistance: distance < 1000
        ? `${Math.round(distance)}m`
        : `${(distance / 1000).toFixed(1)}km`
    };
  });
};

/**
 * Filtra parqueaderos por radio máximo
 * @param {Array} spots - Lista de parqueaderos con distancias
 * @param {number} maxRadius - Radio máximo en metros
 * @returns {Array} Lista de parqueaderos filtrada
 */
export const filterByRadius = (spots, maxRadius) => {
  return spots.filter((spot) => spot.distance <= maxRadius);
};

/**
 * Ordena parqueaderos por distancia
 * @param {Array} spots - Lista de parqueaderos
 * @returns {Array} Lista ordenada por distancia
 */
export const sortByDistance = (spots) => {
  return [...spots].sort((a, b) => a.distance - b.distance);
};
