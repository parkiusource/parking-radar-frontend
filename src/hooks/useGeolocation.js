/**
 * Hook para manejar la geolocalización del usuario.
 * Necesario para:
 * - Encontrar parqueaderos cercanos a la ubicación del usuario
 * - Calcular distancias y ordenar resultados por proximidad
 * - Permitir la navegación hacia los parqueaderos
 *
 * @returns {Object} location, error, loading states y getCurrentLocation function
 */
import { useState, useCallback } from 'react';

// Ubicación por defecto (centro de la ciudad)
const DEFAULT_LOCATION = {
  lat: 4.6097100,
  lng: -74.0817500
};

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  // Verificar el estado del permiso de geolocalización
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return 'prompt'; // Si no hay API de permisos, asumimos que debemos preguntar
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(result.state);

      // Escuchar cambios en el permiso
      result.addEventListener('change', () => {
        setPermissionStatus(result.state);
      });

      return result.state;
    } catch (error) {
      console.warn('Error al verificar permisos:', error);
      return 'prompt';
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalización no soportada en este navegador');
      }

      // Verificar permisos primero
      const permission = await checkPermission();

      if (permission === 'denied') {
        throw new Error('Permiso de ubicación denegado. Por favor, habilítalo en la configuración de tu navegador para encontrar parqueaderos cercanos.');
      }

      setLoading(true);
      setError(null);

      const options = {
        enableHighAccuracy: false, // Priorizar velocidad y ahorro de batería
        timeout: 5000, // Timeout después de 5 segundos
        maximumAge: 300000 // Caché de 5 minutos para la última ubicación conocida
      };

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            const userLoc = { lat: latitude, lng: longitude };
            setLocation(userLoc);
            setLoading(false);
            resolve(userLoc);
          },
          (error) => {
            console.warn('Error de geolocalización:', error.message);
            setError(error);
            setLocation(DEFAULT_LOCATION);
            setLoading(false);
            reject(error);
          },
          options
        );
      });
    } catch (error) {
      setError(error);
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      throw error;
    }
  }, [checkPermission]);

  return {
    location: location || DEFAULT_LOCATION,
    error,
    loading,
    getCurrentLocation,
    permissionStatus,
    checkPermission
  };
};
