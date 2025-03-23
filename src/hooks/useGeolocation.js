import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          const userLoc = { lat: latitude, lng: longitude };
          setLocation(userLoc);
          setLoading(false);
          resolve(userLoc);
        },
        (error) => {
          setError(error);
          setLoading(false);
          reject(error);
        },
        { enableHighAccuracy: false }
      );
    });
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentLocation
  };
};
