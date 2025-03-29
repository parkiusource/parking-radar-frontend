import { useCallback, useRef } from 'react';
import { apiLimiter } from '@/services/apiLimiter';
import { MAP_CONSTANTS } from '@/constants/map';

export const useParkingSearch = (setParkingSpots, getCachedResult, setCachedResult) => {
  if (!setParkingSpots || !getCachedResult || !setCachedResult) {
    throw new Error('useParkingSearch requiere setParkingSpots, getCachedResult y setCachedResult');
  }

  const lastSearchLocationRef = useRef(null);
  const lastSearchTime = useRef(0);
  const MIN_SEARCH_INTERVAL = 2000; // 2 segundos entre búsquedas

  const searchNearbyParking = useCallback((location) => {
    if (!location?.lat || !location?.lng) {
      console.debug('❌ Búsqueda cancelada - Parámetros inválidos');
      return;
    }

    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
    if (!isFinite(lat) || !isFinite(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180) {
      console.debug('❌ Coordenadas fuera de rango válido');
      return;
    }

    const now = Date.now();
    const timeSinceLastSearch = now - lastSearchTime.current;

    if (lastSearchTime.current && timeSinceLastSearch < MIN_SEARCH_INTERVAL) {
      console.debug(`⚠️ Búsqueda omitida - Demasiado frecuente (último: ${timeSinceLastSearch}ms < ${MIN_SEARCH_INTERVAL}ms)`);
      return;
    }

    // Si la ubicación es la misma que la última búsqueda y no ha pasado mucho tiempo
    if (lastSearchLocationRef.current) {
      const isSameLocation = Math.abs(lastSearchLocationRef.current.lat - lat) < 0.0001 &&
                           Math.abs(lastSearchLocationRef.current.lng - lng) < 0.0001;

      if (isSameLocation && timeSinceLastSearch < MAP_CONSTANTS.CACHE_DURATION) {
        console.debug('🔄 Usando resultados en caché - Misma ubicación');
        const cachedResults = getCachedResult(location);
        if (cachedResults?.length > 0) {
          setParkingSpots(cachedResults);
          return;
        }
      }
    }

    console.debug('🔍 Iniciando nueva búsqueda:', {
      location: { lat, lng },
      timeSinceLastSearch: `${timeSinceLastSearch}ms`
    });

    lastSearchTime.current = now;
    lastSearchLocationRef.current = { lat, lng, timestamp: now };

    if (!apiLimiter.canMakeCall()) {
      console.warn('⚠️ Búsqueda omitida - Límite de API alcanzado');
      return;
    }

    apiLimiter.logCall(location);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.currentOpeningHours.openNow',
          'places.businessStatus'
        ].join(',')
      },
      body: JSON.stringify({
        includedTypes: ['parking'],
        maxResultCount: 20,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: 1000.0
          }
        }
      }),
      signal: controller.signal
    })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data.places) {
        console.debug('❌ No se encontraron lugares en la respuesta');
        return;
      }

      const googlePlacesSpots = data.places.map(place => ({
        id: `google_${place.id}_${Date.now()}`,
        googlePlaceId: place.id,
        name: place.displayName?.text || 'Parqueadero',
        address: place.formattedAddress,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        isGooglePlace: true,
        available_spaces: place.currentOpeningHours?.openNow ? 1 : 0,
        total_spaces: 1,
        min_price: 0,
        max_price: 0,
        price_per_hour: 0,
        is_open: place.currentOpeningHours?.openNow ?? true,
        rating: place.rating || 0,
        userRatingCount: place.userRatingTotal || 0,
        businessStatus: place.businessStatus || 'OPERATIONAL',
        lastUpdated: Date.now(),
        // Campos adicionales para el InfoWindow
        vicinity: place.formattedAddress,
        types: place.types || ['parking'],
        photos: place.photos || [],
        openNow: place.currentOpeningHours?.openNow ?? true,
        formattedAddress: place.formattedAddress
      }));

      if (window.google?.maps?.geometry?.spherical) {
        const origin = new window.google.maps.LatLng(lat, lng);
        googlePlacesSpots.forEach(spot => {
          const destination = new window.google.maps.LatLng(spot.latitude, spot.longitude);
          const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
          spot.distance = distanceInMeters / 1000;
          spot.formattedDistance = spot.distance < 1
            ? `${Math.round(distanceInMeters)}m`
            : `${spot.distance.toFixed(1)}km`;
        });
      }

      if (googlePlacesSpots.length > 0) {
        setCachedResult(location, googlePlacesSpots);
      }

      setParkingSpots(googlePlacesSpots);
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        console.debug('❌ Búsqueda cancelada - Timeout');
      } else {
        console.error('❌ Error en búsqueda de Google Places:', error);
      }
      clearTimeout(timeoutId);
    });
  }, [setParkingSpots, getCachedResult, setCachedResult]);

  return {
    searchNearbyParking,
    lastSearchLocationRef
  };
};
