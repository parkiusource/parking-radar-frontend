import { useCallback } from 'react';

export const useNavigation = () => {
  const openNavigation = useCallback((lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }, []);

  return {
    openNavigation
  };
};
