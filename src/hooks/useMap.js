import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

export function useMap(userLocation, targetLocation, defaultLocation) {
  const [mapCenter, setMapCenter] = useState(defaultLocation || MAP_CONSTANTS.DEFAULT_CENTER);
  const [forceMapUpdate, setForceMapUpdate] = useState(false);
  const mapRef = useRef(null);
  const hasInitialized = useRef(false);

  // Determinar la ubicación efectiva para el centro del mapa
  const effectiveTargetLocation = useMemo(() => {
    if (targetLocation) {
      return targetLocation;
    }
    if (userLocation) {
      return userLocation;
    }
    return defaultLocation || MAP_CONSTANTS.DEFAULT_CENTER;
  }, [targetLocation, userLocation, defaultLocation]);

  // Función para centrar el mapa en una ubicación específica
  const centerMapOnLocation = useCallback((location, zoom = null) => {
    if (!location || !mapRef.current) return;

    const map = mapRef.current;
    const currentZoom = map.getZoom();
    const newZoom = zoom || currentZoom;

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
  }, []);

  // Función para manejar la carga inicial del mapa
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    hasInitialized.current = true;

    // Si hay una ubicación objetivo, centrar el mapa en ella
    if (effectiveTargetLocation) {
      centerMapOnLocation(effectiveTargetLocation);
    }
  }, [effectiveTargetLocation, centerMapOnLocation]);

  // Efecto para manejar cambios en la ubicación objetivo
  useEffect(() => {
    if (hasInitialized.current && effectiveTargetLocation && mapRef.current) {
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
