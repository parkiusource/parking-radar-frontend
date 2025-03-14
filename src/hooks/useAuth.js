import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    user
  } = useAuth0();

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
