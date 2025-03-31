/**
 * Utilidades para la creación y manejo de marcadores en el mapa
 */

import { MAP_CONSTANTS } from '@/constants/map';

// Constantes para los colores de los marcadores
export const MARKER_COLORS = {
  PARKIU: '#34D399',         // Color verde brillante de Parkiu
  GOOGLE_PLACES: '#4285F4',  // Color azul de Google
  GOOGLE_PLACES_OPACITY: 0.85, // Opacidad para marcadores de Google
  NO_AVAILABLE: '#8B0000'    // Color rojo para no disponible
};

// Tolerancia para comparar coordenadas
export const COORDINATE_TOLERANCE = 0.0005;

/**
 * Crea el contenido HTML para un marcador de Parkiu
 * @param {Object} spot - Información del parqueadero
 * @returns {HTMLElement} Elemento DOM del marcador
 */
export const createParkiuMarkerContent = (spot) => {
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker parkiu-marker';
  markerElement.style.cssText = `
    position: absolute;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    touch-action: none;
    will-change: transform;
    contain: layout style paint;
  `;

  const color = spot.available_spaces > 0 ? MAP_CONSTANTS.COLOR_PARKIU : MAP_CONSTANTS.COLOR_NO_AVAILABLE;
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
      </filter>
      <path d="M20 2C13.3726 2 8 7.37258 8 14C8 18.8492 12.8033 26.6124 19.4961 31.5568C19.8111 31.8016 20.1889 31.8016 20.5039 31.5568C27.1967 26.6124 32 18.8492 32 14C32 7.37258 26.6274 2 20 2Z"
            fill="${color}"
            filter="url(#shadow)"/>
      <circle cx="20" cy="14" r="8"
              fill="white"
              fill-opacity="0.95"/>
      <text x="20" y="17"
            font-family="Arial, sans-serif"
            font-size="11"
            font-weight="bold"
            text-anchor="middle"
            fill="${color}">
        ${spot.available_spaces}
      </text>
    </svg>
  `;

  markerElement.innerHTML = svg;
  return markerElement;
};

/**
 * Crea el contenido HTML para un marcador de Google Places
 * @returns {HTMLElement} Elemento DOM del marcador
 */
export const createGooglePlacesMarkerContent = () => {
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker google-places-marker';
  markerElement.style.cssText = `
    position: absolute;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    touch-action: none;
    will-change: transform;
    contain: layout style paint;
  `;

  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
      </filter>
      <path d="M20 2C13.3726 2 8 7.37258 8 14C8 18.8492 12.8033 26.6124 19.4961 31.5568C19.8111 31.8016 20.1889 31.8016 20.5039 31.5568C27.1967 26.6124 32 18.8492 32 14C32 7.37258 26.6274 2 20 2Z"
            fill="${MARKER_COLORS.GOOGLE_PLACES}"
            fill-opacity="${MARKER_COLORS.GOOGLE_PLACES_OPACITY}"
            filter="url(#shadow)"/>
      <circle cx="20" cy="14" r="8"
              fill="white"
              fill-opacity="0.95"/>
      <text x="20" y="17"
            font-family="Arial, sans-serif"
            font-size="11"
            font-weight="bold"
            text-anchor="middle"
            fill="${MARKER_COLORS.GOOGLE_PLACES}">
        P
      </text>
    </svg>
  `;

  markerElement.innerHTML = svg;
  return markerElement;
};

/**
 * Crea un marcador avanzado de Google Maps
 * @param {Object} options - Opciones para crear el marcador
 * @returns {google.maps.marker.AdvancedMarkerElement}
 */
export const createMapMarker = (options) => {
  const { position, map, content } = options;

  // Asegurarse de que el contenido sea visible
  if (content) {
    content.style.contentVisibility = 'visible';
    content.style.contain = 'none';
  }

  return new window.google.maps.marker.AdvancedMarkerElement({
    position,
    map,
    content,
    // Configuración avanzada para mejor rendimiento
    gmpDraggable: false,
    collisionBehavior: window.google.maps.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY
  });
};
