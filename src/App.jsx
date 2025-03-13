import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

import { ParkingProvider } from '@/context/ParkingContext';
import { QueryClientContextProvider } from '@/context/QueryClientContext';
import { UserProvider } from '@/context/UserContext';
import AppRoutes from '@/routes/AppRoutes';
import ScrollToTop from '@/services/ScrollToTop';
import { Auth0Provider } from '@auth0/auth0-react';
import RoutePrefetcher from '@/components/RoutePrefetcher';

const AUTH_DOMAIN = import.meta.env.VITE_AUTH_DOMAIN;
const AUTH_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID;

const App = () => (
  <HelmetProvider>
    <div className="bg-secondary-950 overflow-scroll relative h-screen no-scrollbar">
      <div className="w-full min-w-screen min-h-screen">
        <Auth0Provider
          domain={AUTH_DOMAIN}
          clientId={AUTH_CLIENT_ID}
        >
          <QueryClientContextProvider>
            <UserProvider>
              <ParkingProvider>
                <ScrollToTop />
                <RoutePrefetcher />
                <AppRoutes />
              </ParkingProvider>
            </UserProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientContextProvider>
        </Auth0Provider>
      </div>
    </div>
  </HelmetProvider>
);

export default App;
