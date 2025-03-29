import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

export const useMap = (targetLocation, contextTargetLocation, userLocation, onMapLoad) => {
  const mapRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const [forceMapUpdate, setForceMapUpdate] = useState(false);
  const lastUpdateRef = useRef(0);
  const updateTimeoutRef = useRef(null);

  // Memoizar effectiveTargetLocation para evitar recálculos innecesarios
  const effectiveTargetLocation = useMemo(() => {
    if (targetLocation) {
      return targetLocation;
    }
    return contextTargetLocation;
  }, [targetLocation, contextTargetLocation]);

  // Memoizar el centro del mapa para evitar recálculos innecesarios
  const mapCenter = useMemo(() => {
    let center = MAP_CONSTANTS.DEFAULT_LOCATION;

    if (effectiveTargetLocation &&
        isFinite(parseFloat(effectiveTargetLocation.lat)) &&
        isFinite(parseFloat(effectiveTargetLocation.lng))) {
      center = {
        lat: parseFloat(effectiveTargetLocation.lat),
        lng: parseFloat(effectiveTargetLocation.lng)
      };
    } else if (userLocation &&
               isFinite(parseFloat(userLocation.lat)) &&
               isFinite(parseFloat(userLocation.lng))) {
      center = {
        lat: parseFloat(userLocation.lat),
        lng: parseFloat(userLocation.lng)
      };
    }

    return center;
  }, [effectiveTargetLocation, userLocation]);

  // Memoizar la función de centrado del mapa
  const centerMapOnLocation = useCallback((location) => {
    if (!location || !mapRef.current) return;

    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);

    if (!isFinite(lat) || !isFinite(lng)) {
      console.error('Coordenadas inválidas:', location);
      return;
    }

    // Evitar actualizaciones muy frecuentes
    const now = Date.now();
    if (now - lastUpdateRef.current < 100) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        centerMapOnLocation(location);
      }, 100);
      return;
    }

    lastUpdateRef.current = now;
    const defaultZoom = 16;

    // Usar requestAnimationFrame para suavizar las actualizaciones
    requestAnimationFrame(() => {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(defaultZoom);

      mapRef.current.setOptions({
        ...MAP_CONSTANTS.MAP_OPTIONS,
        center: { lat, lng }
      });
    });
  }, []);

  // Memoizar el manejador de carga del mapa
  const handleMapLoad = useCallback((map) => {
    if (!map || mapRef.current === map) return;

    mapRef.current = map;
    mapInitializedRef.current = true;

    // Aplicar opciones iniciales del mapa
    map.setOptions(MAP_CONSTANTS.MAP_OPTIONS);

    // Inicializar el servicio de Places
    if (window.google?.maps?.places) {
      try {
        new window.google.maps.places.PlacesService(map);
      } catch (error) {
        console.error('Error al inicializar Places Service:', error);
      }
    }

    // Inicializar marcadores después de que el mapa esté listo
    const timer = setTimeout(() => {
      if (effectiveTargetLocation) {
        centerMapOnLocation(effectiveTargetLocation);
      } else if (userLocation) {
        centerMapOnLocation(userLocation);
      } else {
        centerMapOnLocation(MAP_CONSTANTS.DEFAULT_LOCATION);
      }
      if (onMapLoad) {
        onMapLoad(map);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [effectiveTargetLocation, userLocation, centerMapOnLocation, onMapLoad]);

  // Efecto para centrar el mapa cuando cambia la ubicación objetivo
  useEffect(() => {
    if (effectiveTargetLocation && mapRef.current) {
      centerMapOnLocation(effectiveTargetLocation);
    }
  }, [effectiveTargetLocation, centerMapOnLocation]);

  // Efecto para manejar actualizaciones forzadas
  useEffect(() => {
    if (forceMapUpdate && mapRef.current && effectiveTargetLocation) {
      centerMapOnLocation(effectiveTargetLocation);
      setForceMapUpdate(false);
    }
  }, [forceMapUpdate, effectiveTargetLocation, centerMapOnLocation]);

  // Memoizar el manejador de actualización forzada
  const handleForceUpdate = useCallback(() => {
    setForceMapUpdate(true);
  }, []);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Memoizar el resultado para evitar recreaciones innecesarias
  return useMemo(() => ({
    mapRef,
    mapInitializedRef,
    handleMapLoad,
    centerMapOnLocation,
    mapCenter,
    effectiveTargetLocation,
    forceMapUpdate,
    setForceMapUpdate,
    handleForceUpdate
  }), [
    handleMapLoad,
    centerMapOnLocation,
    mapCenter,
    effectiveTargetLocation,
    forceMapUpdate,
    handleForceUpdate
  ]);
};
