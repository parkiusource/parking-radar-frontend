import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Hook para obtener parqueaderos cercanos a una ubicación específica
 * @param {Object} params.location - Ubicación con { lat, lng }
 * @param {number} params.radius - Radio de búsqueda en kilómetros (default: 1)
 * @param {Object} params.queryClient - Cliente de React Query
 */
export const useParkingSpots = ({ location, radius = 1, queryClient, ...options }) => {
  // Validar que tengamos coordenadas válidas
  const hasValidLocation = location?.lat != null && location?.lng != null;

  const query = useQuery({
    queryKey: ['parkingSpots', location?.lat, location?.lng, radius],
    queryFn: async () => {
      if (!hasValidLocation) {
        return [];
      }

      const baseURL = import.meta.env.VITE_API_BACKEND_URL || 'https://parking-radar.onrender.com';
      const response = await axios.get(`${baseURL}/parking-lots/nearby`, {
        params: {
          lat: location.lat,
          lng: location.lng,
          radius,
        },
      });
      return response.data.map((parking) => {
        // Valores base que vienen del backend
        const baseData = {
          id: parking.id,
          name: parking.name || 'Parqueadero sin nombre',
          address: parking.address || 'Dirección no disponible',
          available_spaces: parking.available_spaces || 0,
          min_price: parking.min_price || 0,
          distance: parking.distance || 0,
          isGooglePlace: false,
          // Coordenadas - aseguramos que coincidan con los nombres esperados
          latitude: parking.latitude || parking.lat || 4.6097100,
          longitude: parking.longitude || parking.lng || -74.0817500,
          // Mantenemos también lat/lng para compatibilidad
          lat: parking.latitude || parking.lat || 4.6097100,
          lng: parking.longitude || parking.lng || -74.0817500,
          // Objeto location para otros componentes que lo necesiten
          location: {
            lat: parking.latitude || parking.lat || 4.6097100,
            lng: parking.longitude || parking.lng || -74.0817500
          }
        };

        // Valores por defecto para precios y tarifas
        const pricingData = {
          price_per_hour: parking.price_per_hour || 3000,
          price_per_minute: parking.price_per_minute || 50,
          carRate: parking.car_rate || 3000,
          motorcycleRate: parking.motorcycle_rate || 2000,
          bikeRate: parking.bike_rate || 1000,
          hasFullRate: parking.has_full_rate ?? true,
        };

        // Valores por defecto para espacios disponibles
        const spacesData = {
          carSpaces: parking.car_spaces || 5,
          motorcycleSpaces: parking.motorcycle_spaces || 3,
          bikeSpaces: parking.bike_spaces || 2,
          totalSpaces: parking.total_spaces || 10,
        };

        // Valores por defecto para horarios y estado
        const operationalData = {
          is24h: parking.is_24h ?? true,
          operatingHours: parking.operating_hours || '24/7',
          businessStatus: parking.business_status || 'OPERATIONAL',
        };

        // Valores por defecto para características
        const featuresData = {
          hasSecurityCameras: parking.has_security_cameras || true,
          hasOnSiteStaff: parking.has_onsite_staff || true,
          isCovered: parking.is_covered || true,
          heightRestriction: parking.height_restriction || '2.1m',
          vehicleRestrictions: parking.vehicle_restrictions || 'Solo vehículos de tamaño estándar',
          services: parking.services || [
            { id: 1, name: 'Vigilancia 24/7', icon: 'shield' },
            { id: 2, name: 'Personal en sitio', icon: 'users' },
            { id: 3, name: 'Cubierto', icon: 'umbrella' },
          ],
        };

        // Valores por defecto para calificaciones (si es un lugar de Google)
        const ratingData = {
          rating: parking.rating || 4.5,
          userRatingCount: parking.user_rating_count || 150,
        };

        // Combinar todos los datos
        return {
          ...baseData,
          ...pricingData,
          ...spacesData,
          ...operationalData,
          ...featuresData,
          ...ratingData,
          // Calcular campos adicionales
          isFull: baseData.available_spaces === 0,
          formattedDistance: `${baseData.distance.toFixed(1)}`,
        };
      });
    },
    enabled: hasValidLocation && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutos - los datos de parqueaderos cercanos cambian
    cacheTime: 10 * 60 * 1000, // 10 minutos en caché
    ...options,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['parkingSpots'] });

  return { ...query, parkingSpots: query.data || [], invalidate };
};
