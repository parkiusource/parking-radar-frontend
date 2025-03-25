import { useContext } from 'react';
import { QueryClientContext } from './QueryClientContext';

// Configuración de caché por tipo de consulta
export const CACHE_CONFIG = {
  default: {
    staleTime: 1000 * 60, // 1 minuto
    cacheTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  }
};

// Configuraciones específicas para diferentes tipos de consultas
export const getQueryConfig = (queryType) => {
  switch (queryType) {
    case 'googlePlaces':
      return {
        staleTime: 1000 * 60 * 15, // 15 minutos
        cacheTime: 1000 * 60 * 30, // 30 minutos
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      };
    case 'parkingSpots':
      return {
        staleTime: 1000 * 60 * 5, // 5 minutos
        cacheTime: 1000 * 60 * 15, // 15 minutos
      };
    default:
      return CACHE_CONFIG.default;
  }
};

export const useQueryClient = () => {
  const context = useContext(QueryClientContext);
  if (!context) {
    throw new Error(
      'useCustomQueryClient must be used within a CustomQueryClientProvider',
    );
  }
  return context;
};

// Función de utilidad para generar claves de caché para búsquedas de lugares
export const generatePlacesQueryKey = (location, radius = 1000) => {
  if (!location?.lat || !location?.lng) {
    return ['googlePlaces', 'nearby', 'invalid'];
  }
  return [
    'googlePlaces',
    'nearby',
    `${Number(location.lat).toFixed(4)}_${Number(location.lng).toFixed(4)}`,
    radius
  ];
};
