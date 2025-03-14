import { useAuth0 } from '@auth0/auth0-react';

export function useAuth() {
  const auth0 = useAuth0();

  const getToken = async () => {
    try {
      return await auth0.getAccessTokenSilently();
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error;
    }
  };

  return {
    ...auth0,
    getToken,
  };
}
