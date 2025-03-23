import { useState, useCallback, useRef, useEffect } from 'react';
import { MAP_CONSTANTS } from '@/constants/map';

const searchCache = new Map();

const generateUniqueId = (place) => {
  if (place.id) {
    return `google_${place.id}_${Date.now()}`;
  }
  // Fallback para cuando no hay ID, usar coordenadas y timestamp
  return `google_${place.location?.latitude}_${place.location?.longitude}_${Date.now()}`;
};

const getCacheKey = (location) => {
  const gridCell = {
    lat: Math.floor(location.lat / MAP_CONSTANTS.SEARCH_GRID_SIZE) * MAP_CONSTANTS.SEARCH_GRID_SIZE,
    lng: Math.floor(location.lng / MAP_CONSTANTS.SEARCH_GRID_SIZE) * MAP_CONSTANTS.SEARCH_GRID_SIZE
  };
  return `${gridCell.lat},${gridCell.lng}`;
};

export const useParkingSearch = (mapRef, center, radius = MAP_CONSTANTS.DEFAULT_RADIUS) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastSearchLocationRef = useRef(null);
  const spotIdsRef = useRef(new Set()); // Para trackear IDs únicos

  const areLocationsSignificantlyDifferent = useCallback((loc1, loc2) => {
    if (!loc1 || !loc2) return true;
    return Math.abs(loc1.lat - loc2.lat) > MAP_CONSTANTS.COORDINATE_TOLERANCE ||
           Math.abs(loc1.lng - loc2.lng) > MAP_CONSTANTS.COORDINATE_TOLERANCE;
  }, []);

  const searchNearbyParking = useCallback(async (location) => {
    if (!location?.lat || !location?.lng || !mapRef.current) return;

    // Verificar si la ubicación está muy cerca de la última búsqueda
    if (lastSearchLocationRef.current &&
        !areLocationsSignificantlyDifferent(lastSearchLocationRef.current, location)) {
      console.log('🔍 Búsqueda omitida - Ubicación muy cercana a la anterior');
      return;
    }

    // Verificar caché
    const cacheKey = getCacheKey(location);
    const cachedResult = searchCache.get(cacheKey);

    if (cachedResult) {
      const { data, timestamp } = cachedResult;
      const age = Date.now() - timestamp;

      if (age < MAP_CONSTANTS.CACHE_DURATION) {
        console.log('🎯 Usando resultados en caché');
        setParkingSpots(data);
        return;
      } else {
        searchCache.delete(cacheKey);
      }
    }

    setLoading(true);
    lastSearchLocationRef.current = location;
    spotIdsRef.current.clear(); // Limpiar IDs anteriores

    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.rating,places.userRatingCount'
        },
        body: JSON.stringify({
          includedTypes: ['parking'],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lng)
              },
              radius: radius
            }
          }
        })
      });

      const data = await response.json();

      if (!data.places) {
        setParkingSpots([]);
        return;
      }

      const googlePlacesSpots = data.places.map(place => {
        let uniqueId = generateUniqueId(place);

        // Asegurarse de que el ID sea único incluso si hay duplicados
        while (spotIdsRef.current.has(uniqueId)) {
          uniqueId = generateUniqueId(place);
        }
        spotIdsRef.current.add(uniqueId);

        return {
          id: uniqueId,
          name: place.displayName?.text || 'Parqueadero',
          address: place.formattedAddress,
          latitude: place.location.latitude,
          longitude: place.location.longitude,
          isGooglePlace: true,
          rating: place.rating || 0,
          userRatingCount: place.userRatingCount || 0,
          businessStatus: place.businessStatus,
          available_spaces: place.businessStatus === 'OPERATIONAL' ? 1 : 0,
          total_spaces: 1,
          min_price: 0,
          max_price: 0,
          price_per_hour: 0,
          is_open: place.businessStatus === 'OPERATIONAL'
        };
      });

      // Calcular distancias si está disponible el servicio de geometría
      if (window.google?.maps?.geometry?.spherical) {
        const origin = new window.google.maps.LatLng(location.lat, location.lng);
        googlePlacesSpots.forEach(spot => {
          const destination = new window.google.maps.LatLng(spot.latitude, spot.longitude);
          const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
          spot.distance = distanceInMeters / 1000;
          spot.formattedDistance = spot.distance < 1
            ? `${Math.round(distanceInMeters)}m`
            : `${spot.distance.toFixed(1)}km`;
        });
      }

      // Guardar en caché
      searchCache.set(cacheKey, {
        data: googlePlacesSpots,
        timestamp: Date.now()
      });

      setParkingSpots(googlePlacesSpots);
    } catch (error) {
      console.error('❌ Error en búsqueda de Google Places:', error);
      setParkingSpots([]);
    } finally {
      setLoading(false);
    }
  }, [mapRef, radius, areLocationsSignificantlyDifferent]);

  // Limpiar caché periódicamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, { timestamp }] of searchCache.entries()) {
        if (now - timestamp > MAP_CONSTANTS.CACHE_DURATION) {
          searchCache.delete(key);
        }
      }
    }, MAP_CONSTANTS.CACHE_DURATION);

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    parkingSpots,
    loading,
    searchNearbyParking
  };
};
