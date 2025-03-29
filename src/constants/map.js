export const MAP_CONSTANTS = {
  DEFAULT_LOCATION: { lat: 4.711, lng: -74.0721 },
  MAP_ID: import.meta.env.VITE_GOOGLE_MAP_ID,
  COLOR_NO_AVAILABLE: '#DC2626',  // Rojo para no disponibles (red-600)
  COLOR_GOOGLE_PLACES: '#6B7280',  // Gris para Google (gray-500)
  COLOR_PARKIU: '#2563EB',         // Azul para Parkiu (blue-600)
  COORDINATE_TOLERANCE: 0.0005,    // Mayor tolerancia para comparar coordenadas
  MIN_LOCATION_CHANGE: 0.0005,     // Umbral de cambio de ubicación (aproximadamente 50 metros)
  CACHE_DURATION: 30 * 60 * 1000,   // 30 minutos para reducir llamadas a la API
  MIN_SEARCH_INTERVAL: 200,        // Tiempo mínimo entre búsquedas (200ms)
  SEARCH_GRID_SIZE: 0.02,         // Aproximadamente 2km
  DEFAULT_RADIUS: 1000,
  MARKER_COLORS: {
    NO_AVAILABLE: '#8B0000',
    GOOGLE_PLACES: '#4285F4',
    PARKIU: '#34D399'
  },
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
    mapTypeControl: false,
    gestureHandling: 'greedy',
    clickableIcons: false,
    optimized: true,
    gestureHandlingOptions: {
      passiveEvents: true
    },
    tilt: 0,
    heading: 0,
    mapTypeId: 'roadmap',
    draggableCursor: 'default',
    draggingCursor: 'grab',
    keyboardShortcuts: false,
    restriction: null
  },
  LIBRARIES: ['marker', 'geometry'] // Eliminado 'places' ya que usamos la API REST
};
