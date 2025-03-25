import { useCallback, useRef, useEffect } from 'react';
import {
  createMapMarker,
  createParkiuMarkerContent,
  createGooglePlacesMarkerContent,
  COORDINATE_TOLERANCE
} from '@/utils/markerUtils';

/**
 * Hook para manejar los marcadores del mapa
 * @param {Object} mapRef - Referencia al mapa de Google
 * @param {Array} parkingSpots - Lista de parqueaderos
 * @param {Function} onSpotSelect - Callback cuando se selecciona un parqueadero
 * @returns {Object} Funciones y referencias para manejar marcadores
 */
export const useMapMarkers = (mapRef, parkingSpots, onSpotSelect) => {
  const markersRef = useRef([]);
  const spotMarkerMapRef = useRef(new Map());

  const initializeMarkers = useCallback(() => {
    if (!mapRef.current || !parkingSpots?.length) return;

    const existingMarkers = new Map(markersRef.current.map(marker => [marker.spotId, marker]));
    const newMarkers = [];
    const updatedSpotMarkerMap = new Map();

    parkingSpots.forEach(spot => {
      if (!spot.latitude || !spot.longitude) return;

      const marker = existingMarkers.get(spot.id) || createMapMarker({
        map: mapRef.current,
        position: {
          lat: parseFloat(spot.latitude),
          lng: parseFloat(spot.longitude)
        },
        title: spot.name,
        content: spot.isGooglePlace ? createGooglePlacesMarkerContent() : createParkiuMarkerContent(spot)
      });

      if (!existingMarkers.has(spot.id)) {
        marker.isGooglePlace = spot.isGooglePlace;
        marker.spotId = spot.id;

        const clickEvent = window.google?.maps?.marker?.AdvancedMarkerElement ? 'gmp-click' : 'click';
        marker.addListener(clickEvent, () => {
          onSpotSelect(spot);
        });
      }

      newMarkers.push(marker);
      updatedSpotMarkerMap.set(spot.id, marker);
      existingMarkers.delete(spot.id);
    });

    // Limpiar marcadores no utilizados
    existingMarkers.forEach(marker => marker.setMap(null));

    markersRef.current = newMarkers;
    spotMarkerMapRef.current = updatedSpotMarkerMap;
  }, [mapRef, parkingSpots, onSpotSelect]);

  useEffect(() => {
    initializeMarkers();
  }, [initializeMarkers]);

  const highlightMarker = useCallback((spot) => {
    if (!spot || !Array.isArray(markersRef.current) || markersRef.current.length === 0) return;

    let foundMarker = null;

    if (spot.id && spotMarkerMapRef.current.has(spot.id)) {
      foundMarker = spotMarkerMapRef.current.get(spot.id);
    } else {
      for (const marker of markersRef.current) {
        try {
          if (!marker?.position) continue;

          const markerPosition = marker.position;
          const markerLat = markerPosition.lat;
          const markerLng = markerPosition.lng;

          const isMatch =
            Math.abs(markerLat - spot.latitude) < COORDINATE_TOLERANCE &&
            Math.abs(markerLng - spot.longitude) < COORDINATE_TOLERANCE;

          if (isMatch) {
            foundMarker = marker;
            if (spot.id) spotMarkerMapRef.current.set(spot.id, marker);
            break;
          }
        } catch (error) {
          console.error('Error al comparar marcador:', error);
        }
      }
    }

    // Aplicar estilos a todos los marcadores
    markersRef.current.forEach(marker => {
      try {
        if (!marker) return;

        const markerElement = marker.content;
        if (marker === foundMarker) {
          markerElement.style.transform = 'scale(1.5)';
          markerElement.style.zIndex = '10';
          markerElement.style.opacity = '1';
        } else {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.zIndex = '1';
          markerElement.style.opacity = '0.8';
        }
      } catch (error) {
        console.error('Error al aplicar estilo a marcador:', error);
      }
    });
  }, []);

  return {
    markersRef,
    highlightMarker,
    initializeMarkers
  };
};
