import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

export const useMap = (targetLocation, contextTargetLocation, userLocation, onMapLoad) => {
  const mapRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const [forceMapUpdate, setForceMapUpdate] = useState(false);

  // Memoizar effectiveTargetLocation para evitar recálculos innecesarios
  const effectiveTargetLocation = useMemo(() => {
    // Si hay una prop de ubicación objetivo, usarla directamente ignorando el contexto
    if (targetLocation) {
      return targetLocation;
    }
    // De lo contrario, usar el valor del contexto
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

  const centerMapOnLocation = useCallback((location) => {
    if (!location || !mapRef.current) return;

    // Validar que las coordenadas sean números finitos
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);

    if (!isFinite(lat) || !isFinite(lng)) {
      console.error('Coordenadas inválidas:', location);
      return;
    }

    const defaultZoom = 16;
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(defaultZoom);

    // Aplicar opciones del mapa
    mapRef.current.setOptions({
      ...MAP_CONSTANTS.MAP_OPTIONS,
      center: { lat, lng }
    });
  }, []);

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
        // Si no hay ubicación específica, usar la ubicación por defecto
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

  const handleForceUpdate = useCallback(() => {
    setForceMapUpdate(true);
  }, []);

  return {
    mapRef,
    mapInitializedRef,
    handleMapLoad,
    centerMapOnLocation,
    mapCenter,
    effectiveTargetLocation,
    forceMapUpdate,
    setForceMapUpdate,
    handleForceUpdate
  };
};
