import { useMutation } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { createParking as createParkingService } from '../services/admin';

export function useCreateParking({ onSuccess }) {
  const { getAccessTokenSilently } = useAuth0();

  const { mutate } = useMutation({
    mutationFn: async (parking) => {
      const token = await getAccessTokenSilently();
      return createParkingService(token, parking);
    },
    onSuccess,
  });

  return {
    createParking: mutate,
  };
}
