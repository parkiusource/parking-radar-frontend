import { createContext, useContext, useMemo } from 'react';

import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const QueryClientContext = createContext();

const QueryClientContextProvider = ({ children }) => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 3,
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

export const useQueryClient = () => {
  const context = useContext(QueryClientContext);
  if (!context) {
    throw new Error(
      'useCustomQueryClient must be used within a CustomQueryClientProvider',
    );
  }
  return context;
};
