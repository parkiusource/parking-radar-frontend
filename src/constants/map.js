export const MAP_CONSTANTS = {
  DEFAULT_LOCATION: { lat: 4.711, lng: -74.0721 },
  COORDINATE_TOLERANCE: 0.0005,
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutos para reducir llamadas a la API
  SEARCH_GRID_SIZE: 0.02, // Aproximadamente 2km
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
  }
};
