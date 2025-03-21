import { useContext } from 'react';
import { QueryClientContext } from './QueryClientContext';

// Configuración de caché por tipo de consulta
export const CACHE_CONFIG = {
  // Consultas de lugares (Google Places API)
  SearchPlaces: {
    staleTime: 1000 * 60 * 10, // 10 minutos
    cacheTime: 1000 * 60 * 30, // 30 minutos
  },
  // Consultas de parqueaderos (datos internos)
  ParkingSpots: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 15, // 15 minutos
  },
  // Configuración por defecto
  default: {
    staleTime: 1000 * 60, // 1 minuto
    cacheTime: 1000 * 60 * 5, // 5 minutos
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
