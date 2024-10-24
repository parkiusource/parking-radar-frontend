import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import { mutationQuery } from '@/api/base';

const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

const useCreateParking = (options) => {
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await mutationQuery({
        url: `${API_BACKEND_URL}/parking-lots/`,
        method: 'POST',
        data,
      });

      return response;
    },
    ...options,
  });

  const createParking = useCallback(
    (parking) => {
      return mutation.mutate({
        ...parking,
        available_spots: parking.totalSpots,
      });
    },
    [mutation],
  );

  return { ...mutation, createParking };
};

export { useCreateParking };
