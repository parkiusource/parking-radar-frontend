import { createContext, useContext } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const QueryClientContext = createContext();

export const QueryClientContextProvider = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 3,
      },
    },
  });

  return (
    <QueryClientContext.Provider value={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </QueryClientContext.Provider>
  );
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
