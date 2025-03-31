/**
 * Servicio unificado para manejar la geolocalización
 * Incluye:
 * - Configuración de geolocalización
 * - Verificación de permisos
 * - Obtención de ubicación
 * - Manejo de errores y valores por defecto
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Configuración unificada para geolocalización
 * Se usa configuración de baja precisión para:
 * - Optimizar el consumo de batería
 * - Obtener respuestas más rápidas
 * - Suficiente para mostrar parqueaderos cercanos (precisión de 100-1000m)
 */
export const GEOLOCATION_CONFIG = {
  enableHighAccuracy: false, // Priorizar velocidad y ahorro de batería
  timeout: 5000, // 5 segundos máximo de espera
  maximumAge: 300000 // 5 minutos de caché para la última ubicación conocida
};

// Ubicación por defecto (centro de Bogotá)
export const DEFAULT_LOCATION = {
  lat: 4.6097100,
  lng: -74.0817500
};

/**
 * Verifica el estado del permiso de geolocalización
 * @returns {Promise<'granted' | 'denied' | 'prompt'>}
 */
export const checkGeolocationPermission = async () => {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch (error) {
    console.warn('Error al verificar permisos:', error);
    return 'prompt';
  }
};

/**
 * Obtiene la ubicación actual del usuario
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getUserLocation = async () => {
  try {
    if (!navigator.geolocation) {
      throw new Error('Geolocalización no soportada en este navegador');
    }

    const permission = await checkGeolocationPermission();
    if (permission === 'denied') {
      throw new Error('PERMISSION_DENIED');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          let errorMessage;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'PERMISSION_DENIED';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'POSITION_UNAVAILABLE';
              break;
            case error.TIMEOUT:
              errorMessage = 'TIMEOUT';
              break;
            default:
              errorMessage = 'UNKNOWN_ERROR';
          }

          reject(new Error(errorMessage));
        },
        GEOLOCATION_CONFIG
      );
    });
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    throw error;
  }
};

/**
 * Hook para manejar la geolocalización en componentes React
 * @returns {Object} Estado y funciones de geolocalización
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userLoc = await getUserLocation();
      setLocation(userLoc);
      return userLoc;
    } catch (error) {
      setError(error);
      setLocation(DEFAULT_LOCATION);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar permisos al montar el componente
  useEffect(() => {
    checkGeolocationPermission().then(setPermissionStatus);
  }, []);

  return {
    location: location || DEFAULT_LOCATION,
    error,
    loading,
    getCurrentLocation,
    permissionStatus
  };
};
