import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  const scrollToTop = useCallback(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    } catch {
      // Fallback para navegadores que no soportan el objeto options
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    // Usar requestAnimationFrame para asegurar que el scroll ocurra en el siguiente frame
    const frameId = requestAnimationFrame(scrollToTop);

    // Cleanup para cancelar cualquier animación pendiente
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [pathname, scrollToTop]);

  return null;
}
