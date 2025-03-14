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
        totalSpots: parking.available_spaces,
        availableSpots: parking.available_spaces,
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
