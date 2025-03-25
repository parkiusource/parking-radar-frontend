/**
 * Utilidades para la creación y manejo de marcadores en el mapa
 */

// Constantes para los colores de los marcadores
export const MARKER_COLORS = {
  PARKIU: '#34D399',         // Color verde de Parkiu
  GOOGLE_PLACES: '#4285F4',  // Color azul de Google
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
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    opacity: 1;
    visibility: visible;
    transform-origin: center bottom;
  `;

  const color = spot.available_spaces > 0 ? MARKER_COLORS.PARKIU : MARKER_COLORS.NO_AVAILABLE;
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C12.0589 0 5.5 6.5589 5.5 14.5C5.5 20.0649 11.0557 28.5731 18.7882 33.7154C19.5127 34.2728 20.4873 34.2728 21.2118 33.7154C28.9443 28.5731 34.5 20.0649 34.5 14.5C34.5 6.5589 27.9411 0 20 0Z"
            fill="${color}"/>
      <circle cx="20" cy="14.5" r="10"
              fill="white"
              fill-opacity="0.9"/>
      <text x="20" y="18"
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

  // Agregar efectos de hover
  markerElement.addEventListener('mouseover', () => {
    markerElement.style.transform = 'scale(1.1) translateY(-2px)';
    markerElement.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
  });

  markerElement.addEventListener('mouseout', () => {
    markerElement.style.transform = 'scale(1) translateY(0)';
    markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
  });

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
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    opacity: 1;
    visibility: visible;
    transform-origin: center bottom;
  `;

  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C12.0589 0 5.5 6.5589 5.5 14.5C5.5 20.0649 11.0557 28.5731 18.7882 33.7154C19.5127 34.2728 20.4873 34.2728 21.2118 33.7154C28.9443 28.5731 34.5 20.0649 34.5 14.5C34.5 6.5589 27.9411 0 20 0Z"
            fill="${MARKER_COLORS.GOOGLE_PLACES}"/>
      <circle cx="20" cy="14.5" r="10"
              fill="white"
              fill-opacity="0.9"/>
      <text x="20" y="18"
            font-family="Arial, sans-serif"
            font-size="11"
            font-weight="bold"
            text-anchor="middle"
            fill="${MARKER_COLORS.GOOGLE_PLACES}">
        G
      </text>
    </svg>
  `;

  markerElement.innerHTML = svg;

  // Agregar efectos de hover
  markerElement.addEventListener('mouseover', () => {
    markerElement.style.transform = 'scale(1.1) translateY(-2px)';
    markerElement.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
  });

  markerElement.addEventListener('mouseout', () => {
    markerElement.style.transform = 'scale(1) translateY(0)';
    markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
  });

  return markerElement;
};

/**
 * Crea un marcador de Google Maps
 * @param {Object} options - Opciones para crear el marcador
 * @returns {google.maps.Marker|google.maps.marker.AdvancedMarkerElement}
 */
export const createMapMarker = (options) => {
  if (window.google?.maps?.marker?.AdvancedMarkerElement) {
    return new window.google.maps.marker.AdvancedMarkerElement(options);
  } else {
    console.log('⚠️ AdvancedMarkerElement no disponible, usando Marker estándar');
    if (options.content) {
      const svgContent = options.content.innerHTML;
      options.icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40)
      };
      delete options.content;
    }
    return new window.google.maps.Marker(options);
  }
};
