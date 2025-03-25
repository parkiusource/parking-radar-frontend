/**
 * Utilidades para la navegación
 */

/**
 * Abre Google Maps con la ruta hacia una ubicación específica
 * @param {number} lat - Latitud del destino
 * @param {number} lng - Longitud del destino
 */
export const openGoogleMapsNavigation = (lat, lng) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
};
