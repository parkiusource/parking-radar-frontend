import { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CACHE_CONFIG } from './queryClientUtils';

export const QueryClientContext = createContext();

const QueryClientContextProvider = ({ children }) => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 3,
        // Configuración por defecto
        staleTime: CACHE_CONFIG.default.staleTime,
        cacheTime: CACHE_CONFIG.default.cacheTime,
        // Usar políticas de caché específicas basadas en queryKey
        gcTime: CACHE_CONFIG.default.cacheTime,
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
