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

  return useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log('useAdminProfile: Not authenticated');
        return null;
      }
      try {
        const token = await getAccessTokenSilently();
        console.log('useAdminProfile: Fetching data...');

        const [profileResponse, parkingLotsData] = await Promise.all([
          getAdminProfile(token).catch(error => {
            console.error('Error fetching profile:', error);
            return null;
          }),
          getParkingLots(token).catch(error => {
            console.error('Error fetching parking lots:', error);
            return { parking_lots: [] };
          })
        ]);

        console.log('useAdminProfile: Raw data:', {
          profile: JSON.stringify(profileResponse, null, 2),
          parkingLots: JSON.stringify(parkingLotsData, null, 2)
        });

        // Si no hay perfil, retornar estado inicial
        if (!profileResponse?.profile) {
          console.log('useAdminProfile: No profile found');
          return {
            isProfileComplete: false,
            hasParking: false,
          };
        }

        const profile = profileResponse.profile;

        // Verificar cada campo requerido individualmente
        const requiredFields = {
          name: profile.name?.trim() || '',
          nit: profile.nit?.trim() || '',
          contact_phone: profile.contact_phone?.trim() || '',
          email: profile.email?.trim() || ''
        };

        console.log('useAdminProfile: Required fields:', requiredFields);

        // Verificar que todos los campos requeridos estén presentes y no vacíos
        const isProfileComplete = Object.entries(requiredFields).every(([field, value]) => {
          const isValid = value !== '';
          if (!isValid) {
            console.log(`useAdminProfile: Field ${field} is invalid or empty:`, value);
          }
          return isValid;
        });

        // Extraer el array de parqueaderos del objeto de respuesta
        const parkingLots = parkingLotsData?.parking_lots || [];
        const hasParking = Array.isArray(parkingLots) && parkingLots.length > 0;

        console.log('useAdminProfile: Final state:', {
          isProfileComplete,
          hasParking,
          parkingLotsCount: parkingLots.length,
          validations: {
            name: requiredFields.name !== '',
            nit: requiredFields.nit !== '',
            contact_phone: requiredFields.contact_phone !== '',
            email: requiredFields.email !== ''
          }
        });

        return {
          ...profile,
          isProfileComplete,
          hasParking,
          parkingLots
        };
      } catch (error) {
        console.error('useAdminProfile: Error fetching data:', error);
        if (error.response?.status === 404) {
          return {
            isProfileComplete: false,
            hasParking: false,
          };
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 30000,
    cacheTime: 60000,
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

// Hook para Administrar un nuevo parqueadero
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
