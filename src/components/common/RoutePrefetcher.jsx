import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Lista de rutas principales para hacer prefetch
const mainRoutes = [
  () => import('@/pages/HomePage'),
  () => import('@/pages/About'),
  () => import('@/pages/Parking'),
];

const RoutePrefetcher = () => {
  const location = useLocation();

  useEffect(() => {
    // Prefetch de rutas principales cuando el usuario está en la página principal
    if (location.pathname === '/') {
      mainRoutes.forEach((route) => {
        // Prefetch de la ruta
        route().catch(() => {
          // Manejar error silenciosamente
        });
      });
    }
  }, [location]);

  return null;
};

export default RoutePrefetcher;
