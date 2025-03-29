export const MAP_CONSTANTS = {
  DEFAULT_LOCATION: { lat: 4.711, lng: -74.0721 },
  MAP_ID: import.meta.env.VITE_GOOGLE_MAP_ID,
  COLOR_NO_AVAILABLE: '#DC2626',  // Rojo para no disponibles (red-600)
  COLOR_GOOGLE_PLACES: '#6B7280',  // Gris para Google (gray-500)
  COLOR_PARKIU: '#2563EB',         // Azul para Parkiu (blue-600)
  COORDINATE_TOLERANCE: 0.0005,    // Mayor tolerancia para comparar coordenadas
  MIN_LOCATION_CHANGE: 0.0005,     // Umbral de cambio de ubicación (aproximadamente 50 metros)
  CACHE_DURATION: 2 * 60 * 1000,   // Tiempo máximo de caché (2 minutos)
  MIN_SEARCH_INTERVAL: 200,        // Tiempo mínimo entre búsquedas (200ms)
  LIBRARIES: ['places', 'marker', 'geometry'],
  GOOGLE_PLACE_ICON: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  PARKING_ICON: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  MAP_OPTIONS: {
    mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
    zoomControlOptions: {
      position: 3, // LEFT_BOTTOM
    },
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: 7, // RIGHT_BOTTOM
    },
    streetViewControl: false,
    disableDefaultUI: false,
    scaleControl: true,
    scaleControlOptions: {
      position: 5,
    },
    zoomControl: true,
    clickableIcons: false,
    optimized: true,
    gestureHandling: 'greedy',
    gestureHandlingOptions: {
      passiveEvents: true,
      cooperativeTouchGestures: true,
      touchHandlingOptions: {
        passive: true,
        preventDefaultOnPanGesture: true
      }
    },
    scrollwheel: true,
    ctrlKey: true,
    disableDoubleClickZoom: true,
    minZoom: 12,
    maxZoom: 20,
    restriction: {
      latLngBounds: {
        north: 85,
        south: -85,
        west: -180,
        east: 180
      },
      strictBounds: true
    }
  }
};
