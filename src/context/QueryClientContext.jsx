import { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CACHE_CONFIG } from './queryClientUtils';

export const QueryClientContext = createContext();

const QueryClientContextProvider = ({ children }) => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        ...CACHE_CONFIG.default,
        // Función para determinar la configuración de caché basada en el queryKey
        getNextPageParam: (lastPage) => lastPage?.nextPage,
        select: (data) => data,
        onError: (error) => {
          console.error('Query error:', error);
        },
        // Función para determinar la configuración específica basada en el queryKey
        queryKeyHashFn: (queryKey) => {
          // Si el queryKey comienza con 'googlePlaces', usar configuración de GoogleMaps
          if (Array.isArray(queryKey) && queryKey[0] === 'googlePlaces') {
            return {
              ...CACHE_CONFIG.GoogleMaps,
            };
          }
          // Si el queryKey comienza con 'parkingSpots', usar configuración de ParkingSpots
          if (Array.isArray(queryKey) && queryKey[0] === 'parkingSpots') {
            return {
              ...CACHE_CONFIG.ParkingSpots,
            };
          }
          // Usar configuración por defecto para otros casos
          return {
            ...CACHE_CONFIG.default,
          };
        },
      },
    },
  }), []);

  return (
    <QueryClientContext.Provider value={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </QueryClientContext.Provider>
  );
};

QueryClientContextProvider.displayName = 'QueryClientContextProvider';

QueryClientContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { QueryClientContextProvider };
