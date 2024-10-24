import { fetchQuery, Queries } from '@/api/base';
import { useQuery } from '@tanstack/react-query';

const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

export const useParkingSpots = ({ queryClient }) => {
  const query = useQuery({
    queryKey: [Queries.ParkingSpots],
    queryFn: fetchQuery({
      url: `${API_BACKEND_URL}/parking-lots/`,
      method: 'GET',
    }),
    staleTime: Infinity,
    select: (data) => {
      return data.map((parking) => ({
        ...parking,
        totalSpots: parking.available_spaces,
        availableSpots: parking.available_spaces,
      }));
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: Queries.ParkingSpots });

  return { ...query, parkingSpots: query.data || [], invalidate };
};
