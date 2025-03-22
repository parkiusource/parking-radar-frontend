import { useQuery } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { client } from '../client';

export const useParkingSpots = ({ queryClient, ...options }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const query = useQuery({
    queryKey: ['parkingSpots'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      const token = await getAccessTokenSilently();
      const response = await client.get('/parking-lots/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.map((parking) => ({
        ...parking,
        id: parking.id,
        name: parking.name || 'Parqueadero sin nombre',
        address: parking.address || 'Dirección no disponible',
        available_spaces: parking.available_spaces || 0,
        min_price: parking.min_price || 0,
        rating: parking.rating || null,
        formattedDistance: typeof parking.distance === 'number'
          ? `${parking.distance.toFixed(1)}`
          : '0.0',
        isFull: parking.available_spaces === 0,
      }));
    },
    enabled: isAuthenticated && options?.enabled,
    staleTime: Infinity,
    ...options,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['parkingSpots'] });

  return { ...query, parkingSpots: query.data || [], invalidate };
};
