import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Auth0Provider } from '@auth0/auth0-react';
import { Helmet } from 'react-helmet-async';

import { ParkingProvider } from '@/context/ParkingContext';
import { QueryClientContextProvider } from '@/context/QueryClientContext';
import { UserProvider } from '@/context/UserContext';
import AppRoutes from '@/routes/AppRoutes';
import ScrollToTop from '@/components/ScrollToTop';
import RoutePrefetcher from '@/components/RoutePrefetcher';

const AUTH_DOMAIN = import.meta.env.VITE_AUTH_DOMAIN;
const AUTH_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID;
const IS_DEV = import.meta.env.DEV;

const App = () => (
  <HelmetProvider>
    {/* SEO defaults */}
    <Helmet defaultTitle="ParkiÜ - Encuentra parqueaderos en tiempo real" titleTemplate="%s | ParkiÜ">
      <html lang="es" />
      <meta name="description" content="Encuentra parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad y ubicación de estacionamientos cercanos." />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#075985" />
      <link rel="canonical" href="https://parkiu.app" />
    </Helmet>

    <div className="bg-secondary-950 overflow-scroll relative h-screen no-scrollbar" role="application">
      <div className="w-full min-w-screen min-h-screen">
        <Auth0Provider
          domain={AUTH_DOMAIN}
          clientId={AUTH_CLIENT_ID}
          cacheLocation="localstorage"
        >
          <QueryClientContextProvider>
            <UserProvider>
              <ParkingProvider>
                <ScrollToTop />
                <RoutePrefetcher />
                <AppRoutes />
              </ParkingProvider>
            </UserProvider>
            {IS_DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientContextProvider>
        </Auth0Provider>
      </div>
    </div>
  </HelmetProvider>
);

export default App;
