import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuando la ruta cambia, hacer scroll al inicio de la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Usar 'instant' en lugar de 'smooth' para evitar animaciones no deseadas
    });
  }, [pathname]);

  return null;
}
