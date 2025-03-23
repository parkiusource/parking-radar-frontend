import { useCallback, useRef, useEffect } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

export const useMapMarkers = (mapRef, parkingSpots, onSpotSelect) => {
  const markersRef = useRef([]);
  const spotMarkerMapRef = useRef(new Map());

  const createParkiuMarkerContent = useCallback((spot) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker parkiu-marker';
    markerElement.style.cssText = `
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    `;

    const color = spot.available_spaces > 0 ? MAP_CONSTANTS.MARKER_COLORS.PARKIU : MAP_CONSTANTS.MARKER_COLORS.NO_AVAILABLE;
    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C12.0589 0 5.5 6.5589 5.5 14.5C5.5 20.0649 11.0557 28.5731 18.7882 33.7154C19.5127 34.2728 20.4873 34.2728 21.2118 33.7154C28.9443 28.5731 34.5 20.0649 34.5 14.5C34.5 6.5589 27.9411 0 20 0Z"
              fill="${color}"/>
        <circle cx="20" cy="14.5" r="10"
                fill="white"
                fill-opacity="0.9"/>
        <text x="20" y="18"
              font-family="Arial, sans-serif"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              fill="${color}">
          ${spot.available_spaces}
        </text>
      </svg>
    `;

    markerElement.innerHTML = svg;

    // Agregar efectos de hover
    markerElement.addEventListener('mouseover', () => {
      markerElement.style.transform = 'scale(1.1) translateY(-2px)';
      markerElement.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
    });

    markerElement.addEventListener('mouseout', () => {
      markerElement.style.transform = 'scale(1) translateY(0)';
      markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
    });

    return markerElement;
  }, []);

  const createGooglePlacesMarkerContent = useCallback(() => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker google-places-marker';
    markerElement.style.cssText = `
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    `;

    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C12.0589 0 5.5 6.5589 5.5 14.5C5.5 20.0649 11.0557 28.5731 18.7882 33.7154C19.5127 34.2728 20.4873 34.2728 21.2118 33.7154C28.9443 28.5731 34.5 20.0649 34.5 14.5C34.5 6.5589 27.9411 0 20 0Z"
              fill="${MAP_CONSTANTS.MARKER_COLORS.GOOGLE_PLACES}"/>
        <circle cx="20" cy="14.5" r="10"
                fill="white"
                fill-opacity="0.9"/>
        <text x="20" y="18"
              font-family="Arial, sans-serif"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              fill="${MAP_CONSTANTS.MARKER_COLORS.GOOGLE_PLACES}">
          G
        </text>
      </svg>
    `;

    markerElement.innerHTML = svg;

    // Agregar efectos de hover
    markerElement.addEventListener('mouseover', () => {
      markerElement.style.transform = 'scale(1.1) translateY(-2px)';
      markerElement.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
    });

    markerElement.addEventListener('mouseout', () => {
      markerElement.style.transform = 'scale(1) translateY(0)';
      markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
    });

    return markerElement;
  }, []);

  const createMapMarker = useCallback((options) => {
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      return new window.google.maps.marker.AdvancedMarkerElement(options);
    } else {
      console.log('⚠️ AdvancedMarkerElement no disponible, usando Marker estándar');
      if (options.content) {
        const svgContent = options.content.innerHTML;
        options.icon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        };
        delete options.content;
      }
      return new window.google.maps.Marker(options);
    }
  }, []);

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
  }, [mapRef, parkingSpots, createMapMarker, createGooglePlacesMarkerContent, createParkiuMarkerContent, onSpotSelect]);

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
            Math.abs(markerLat - spot.latitude) < MAP_CONSTANTS.COORDINATE_TOLERANCE &&
            Math.abs(markerLng - spot.longitude) < MAP_CONSTANTS.COORDINATE_TOLERANCE;

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
        } else {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.zIndex = '1';
        }
      } catch (error) {
        console.error('Error al aplicar estilo a marcador:', error);
      }
    });
  }, []);

  return {
    markersRef,
    highlightMarker
  };
};
