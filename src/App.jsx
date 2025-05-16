import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Helmet } from 'react-helmet-async';

import { ParkingProvider } from '@/context/ParkingProvider';
import QueryClientProvider from '@/context/QueryClientProvider';
import AppRoutes from '@/routes/AppRoutes';
import ScrollToTop from '@/components/common/ScrollToTop';
import RoutePrefetcher from '@/components/common/RoutePrefetcher';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const IS_DEV = import.meta.env.DEV;

// Datos estructurados para SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ParkiÜ",
  "description": "Encuentra parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad y ubicación de estacionamientos cercanos.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Búsqueda de parqueaderos en tiempo real",
    "Visualización en mapa interactivo",
    "Información de disponibilidad",
    "Tarifas actualizadas"
  ]
};

const App = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        {/* SEO defaults */}
        <Helmet defaultTitle="ParkiÜ - Encuentra parqueaderos en tiempo real" titleTemplate="%s | ParkiÜ">
          <html lang="es" />
          <meta name="description" content="Encuentra parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad y ubicación de estacionamientos cercanos." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#075985" />
          <link rel="canonical" href="https://parkiu.app" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://parkiu.app" />
          <meta property="og:title" content="ParkiÜ - Encuentra parqueaderos en tiempo real" />
          <meta property="og:description" content="Encuentra parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad y ubicación de estacionamientos cercanos." />
          <meta property="og:image" content="/og-image.jpg" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://parkiu.app" />
          <meta property="twitter:title" content="ParkiÜ - Encuentra parqueaderos en tiempo real" />
          <meta property="twitter:description" content="Encuentra parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad y ubicación de estacionamientos cercanos." />
          <meta property="twitter:image" content="/og-image.jpg" />

          {/* Datos estructurados */}
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>

        <div className="bg-secondary-950 overflow-scroll relative h-screen no-scrollbar" role="application">
          <div className="w-full min-w-screen min-h-screen">
            <QueryClientProvider>
              <ParkingProvider>
                <ScrollToTop />
                <RoutePrefetcher />
                <AppRoutes />
              </ParkingProvider>
              {IS_DEV && <ReactQueryDevtools initialIsOpen={false} />}
            </QueryClientProvider>
          </div>
        </div>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
