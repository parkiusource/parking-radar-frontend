import { useAuth0 } from '@auth0/auth0-react';

const useAuth = () => {
  const auth0 = useAuth0();

  const loginWithLocale = ({
    redirect_uri = `${window.location.origin}/admin`,
  } = {}) => {
    auth0.loginWithRedirect({
      authorizationParams: {
        ui_locales: 'es',
        redirect_uri,
      },
    });
  };

  return {
    ...auth0,
    loginWithLocale,
  };
};

export { useAuth };
