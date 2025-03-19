import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/admin/gateway', { replace: true });
  };

  // Handle authentication errors
  const onError = (error) => {
    console.error('Auth error:', error);
    if (error.error === 'invalid_grant' || error.error === 'login_required') {
      console.log('Clearing storage and redirecting to login...');
      // Clear all auth-related storage
      localStorage.clear();
      sessionStorage.clear();
      // Remove specific Auth0 items
      localStorage.removeItem('@@auth0spajs@@');
      // Force reload to clear any in-memory state
      window.location.replace('/login');
    }
  };

  if (!(domain && clientId && audience)) {
    console.error('Missing required Auth0 configuration');
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email offline_access',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
      onError={onError}
      useRefreshTokensFallback={true}
    >
      {children}
    </Auth0Provider>
  );
};
