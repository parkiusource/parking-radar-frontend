import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuth0Client } from '@/api/client';

export const useInitAuth0Client = () => {
  const auth0 = useAuth0();

  useEffect(() => {
    if (auth0.isAuthenticated) {
      setAuth0Client(auth0);
    }
  }, [auth0, auth0.isAuthenticated]);

  return auth0;
};
