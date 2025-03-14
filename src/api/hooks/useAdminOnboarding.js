import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import {
  completeAdminProfile,
  getAdminProfile,
  getParkingLots,
  registerParkingLot,
  getOnboardingStatus,
  updateOnboardingStep,
} from '../services/admin';

// Hook para obtener el perfil del administrador
export function useAdminProfile() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const token = await getAccessTokenSilently();
        const [profile, parkingLots] = await Promise.all([
          getAdminProfile(token),
          getParkingLots(token).catch(() => [])
        ]);

        return {
          ...profile,
          isProfileComplete: !!(profile?.name && profile?.nit && profile?.contact_phone),
          hasParking: parkingLots?.length > 0
        };
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
        if (error.response?.status === 404) {
          return { isProfileComplete: false, hasParking: false };
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 30000, // 30 segundos
    cacheTime: 60000, // 1 minuto
  });
}

// Hook para obtener los parqueaderos del administrador
export function useAdminParkingLots() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: ['adminParkingLots'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      const token = await getAccessTokenSilently();
      return getParkingLots(token);
    },
    enabled: isAuthenticated,
    retry: 1,
    onError: (error) => {
      console.error('Error al obtener los parqueaderos:', error);
    },
  });
}

// Hook para obtener el estado del onboarding
export function useOnboardingStatus() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      const token = await getAccessTokenSilently();
      return getOnboardingStatus(token);
    },
    enabled: isAuthenticated,
    retry: 1,
  });
}

// Hook para completar el perfil del administrador
export function useCompleteProfile() {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  return useMutation({
    mutationFn: async (formData) => {
      const token = await getAccessTokenSilently();
      return completeAdminProfile(formData, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    },
  });
}

// Hook para registrar un nuevo parqueadero
export function useRegisterParkingLot() {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  return useMutation({
    mutationFn: async (parkingData) => {
      const token = await getAccessTokenSilently();
      return registerParkingLot(parkingData, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminParkingLots'] });
    },
  });
}

// Hook para actualizar el paso del onboarding
export function useUpdateOnboardingStep() {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  return useMutation({
    mutationFn: async (step) => {
      const token = await getAccessTokenSilently();
      return updateOnboardingStep(step, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
    },
  });
}
