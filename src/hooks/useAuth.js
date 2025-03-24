import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect } from 'react';
import { setAuth0Client } from '@/api/client';

export function useAuth() {
  const auth0 = useAuth0();
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    user
  } = auth0;

  // Inicializar el cliente Auth0 cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setAuth0Client(auth0);
    }
  }, [isAuthenticated, auth0]);

  const getToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error;
    }
  }, [getAccessTokenSilently]);

  const handleLogin = useCallback((options = {}) => {
    return loginWithRedirect({
      appState: { returnTo: '/admin/onboarding', ...options.appState },
      ...options
    });
  }, [loginWithRedirect]);

  const handleLogout = useCallback(async (options = {}) => {
    return logout({
      logoutParams: {
        returnTo: window.location.origin,
        ...options.logoutParams
      },
      ...options
    });
  }, [logout]);

  return {
    isAuthenticated,
    isLoading,
    user,
    getToken,
    loginWithRedirect: handleLogin,
    logout: handleLogout
  };
}
