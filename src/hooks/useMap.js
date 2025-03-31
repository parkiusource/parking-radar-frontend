import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

// Función auxiliar para validar coordenadas
const validateCoordinates = (location) => {
  if (!location?.lat || !location?.lng) return false;
  const lat = parseFloat(location.lat);
  const lng = parseFloat(location.lng);
  return !isNaN(lat) && !isNaN(lng) &&
         lat >= -90 && lat <= 90 &&
         lng >= -180 && lng <= 180;
};

export function useMap(userLocation, targetLocation, defaultLocation) {
  const [mapCenter, setMapCenter] = useState(defaultLocation || MAP_CONSTANTS.DEFAULT_CENTER);
  const [forceMapUpdate, setForceMapUpdate] = useState(false);
  const mapRef = useRef(null);
  const hasInitialized = useRef(false);

  // Determinar la ubicación efectiva para el centro del mapa
  const effectiveTargetLocation = useMemo(() => {
    if (targetLocation && validateCoordinates(targetLocation)) {
      return targetLocation;
    }
    if (userLocation && validateCoordinates(userLocation)) {
      return userLocation;
    }
    return defaultLocation || MAP_CONSTANTS.DEFAULT_CENTER;
  }, [targetLocation, userLocation, defaultLocation]);

  // Función para centrar el mapa en una ubicación específica
  const centerMapOnLocation = useCallback((location, zoom = null) => {
    if (!location || !mapRef.current || !validateCoordinates(location)) {
      console.warn('Invalid location provided to centerMapOnLocation:', location);
      return;
    }

    const map = mapRef.current;
    const currentZoom = map.getZoom();
    const newZoom = zoom || currentZoom;

    try {
      // Usar panTo para una transición suave
      map.panTo({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      });

      // Ajustar el zoom si es necesario
      if (newZoom !== currentZoom) {
        map.setZoom(newZoom);
      }

      setMapCenter(location);
    } catch (error) {
      console.error('Error centering map:', error);
    }
  }, []);

  // Función para manejar la carga inicial del mapa
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    hasInitialized.current = true;

    // Si hay una ubicación objetivo válida, centrar el mapa en ella
    if (effectiveTargetLocation && validateCoordinates(effectiveTargetLocation)) {
      centerMapOnLocation(effectiveTargetLocation);
    }
  }, [effectiveTargetLocation, centerMapOnLocation]);

  // Efecto para manejar cambios en la ubicación objetivo
  useEffect(() => {
    if (hasInitialized.current && effectiveTargetLocation && mapRef.current && validateCoordinates(effectiveTargetLocation)) {
      centerMapOnLocation(effectiveTargetLocation);
    }
  }, [effectiveTargetLocation, centerMapOnLocation]);

  return {
    mapCenter,
    effectiveTargetLocation,
    handleMapLoad,
    centerMapOnLocation,
    forceMapUpdate,
    setForceMapUpdate
  };
}
