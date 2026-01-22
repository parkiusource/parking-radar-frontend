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
        // Datos base del parqueadero
        const baseData = {
          id: parking.id,
          name: parking.name || 'Parqueadero sin nombre',
          address: parking.address || 'Dirección no disponible',
          description: parking.description || '',
          distance: parking.distance || 0,
          isGooglePlace: false,
          is_active: parking.is_active ?? true,
          // Coordenadas
          latitude: parking.latitude || 4.6097100,
          longitude: parking.longitude || -74.0817500,
          lat: parking.latitude || 4.6097100,
          lng: parking.longitude || -74.0817500,
          location: {
            lat: parking.latitude || 4.6097100,
            lng: parking.longitude || -74.0817500
          }
        };

        // Espacios disponibles por tipo de vehículo
        const spacesData = {
          total_spaces: parking.total_spaces || 0,
          available_spaces: parking.available_spaces || 0,
          available_car_spaces: parking.available_car_spaces || 0,
          available_motorcycle_spaces: parking.available_motorcycle_spaces || 0,
          available_bicycle_spaces: parking.available_bicycle_spaces || 0,
          // Alias para compatibilidad
          carSpaces: parking.available_car_spaces || 0,
          motorcycleSpaces: parking.available_motorcycle_spaces || 0,
          bikeSpaces: parking.available_bicycle_spaces || 0,
          totalSpaces: parking.total_spaces || 0,
        };

        // Tarifas por minuto (actuales del backend)
        const ratesPerMinute = {
          car_rate_per_minute: parking.car_rate_per_minute || 0,
          motorcycle_rate_per_minute: parking.motorcycle_rate_per_minute || 0,
          bicycle_rate_per_minute: parking.bicycle_rate_per_minute || 0,
          truck_rate_per_minute: parking.truck_rate_per_minute || 0,
        };

        // Tarifas fijas (después de threshold)
        const fixedRates = {
          fixed_rate_car: parking.fixed_rate_car || 0,
          fixed_rate_motorcycle: parking.fixed_rate_motorcycle || 0,
          fixed_rate_bicycle: parking.fixed_rate_bicycle || 0,
          fixed_rate_truck: parking.fixed_rate_truck || 0,
          fixed_rate_threshold_minutes: parking.fixed_rate_threshold_minutes || 720,
        };

        // Tarifas legacy (para compatibilidad con código existente)
        const legacyRates = {
          hourly_rate: parking.hourly_rate || 0,
          daily_rate: parking.daily_rate || 0,
          monthly_rate: parking.monthly_rate || 0,
          // Convertir tarifas por minuto a por hora para compatibilidad
          price_per_hour: parking.car_rate_per_minute ? parking.car_rate_per_minute * 60 : (parking.hourly_rate || 0),
          price_per_minute: parking.car_rate_per_minute || 0,
          carRate: parking.car_rate_per_minute ? parking.car_rate_per_minute * 60 : 0,
          motorcycleRate: parking.motorcycle_rate_per_minute ? parking.motorcycle_rate_per_minute * 60 : 0,
          bikeRate: parking.bicycle_rate_per_minute ? parking.bicycle_rate_per_minute * 60 : 0,
        };

        // Horarios y contacto
        const operationalData = {
          opening_time: parking.opening_time || '00:00',
          closing_time: parking.closing_time || '23:59',
          is24h: parking.opening_time === '00:00' && parking.closing_time === '23:59',
          operatingHours: parking.opening_time && parking.closing_time
            ? `${parking.opening_time} - ${parking.closing_time}`
            : '24/7',
          contact_name: parking.contact_name || '',
          contact_phone: parking.contact_phone || '',
          admin_id: parking.admin_id,
          businessStatus: parking.is_active ? 'OPERATIONAL' : 'CLOSED',
        };

        // Timestamps
        const timestamps = {
          created_at: parking.created_at,
          updated_at: parking.updated_at,
        };

        // Combinar todos los datos
        return {
          ...baseData,
          ...spacesData,
          ...ratesPerMinute,
          ...fixedRates,
          ...legacyRates,
          ...operationalData,
          ...timestamps,
          // Campos calculados
          isFull: (parking.available_spaces || 0) === 0,
          formattedDistance: parking.distance ? `${parking.distance.toFixed(1)} km` : 'N/A',
          // Precio mínimo para mostrar (tarifa más baja por minuto convertida a por hora)
          min_price: Math.min(
            parking.car_rate_per_minute || Infinity,
            parking.motorcycle_rate_per_minute || Infinity,
            parking.bicycle_rate_per_minute || Infinity
          ) * 60,
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
