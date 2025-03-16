import axios from 'axios';

const createClient = () => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BACKEND_URL,
  });

  let auth0Client = null;

  // Función para establecer el cliente de Auth0
  const setAuth0Client = (auth0Instance) => {
    auth0Client = auth0Instance;
  };

  // Interceptor para agregar el token a todas las peticiones
  client.interceptors.request.use(async (config) => {
    try {
      if (!auth0Client) {
        console.error('No se ha configurado el cliente de Auth0');
        return Promise.reject(new Error('Auth0 client not configured'));
      }

      // Obtener un token fresco usando getAccessTokenSilently con scope específico
      const token = await auth0Client.getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH_AUDIENCE,
          scope: 'openid profile email offline_access'
        }
      });

      if (!token) {
        console.error('No se pudo obtener el token de Auth0');
        return Promise.reject(new Error('No token available'));
      }

      // Debug detallado del token
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token detallado:', {
          audiences: payload.aud,
          scope: payload.scope,
          issuer: payload.iss,
          permissions: payload.permissions,
          roles: payload.roles,
          exp: payload.exp,
          iat: payload.iat,
          azp: payload.azp,
          gty: payload.gty
        });
      } catch (error) {
        console.error('Error decodificando token:', error);
      }

      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return Promise.reject(error);
    }
  });

  // Interceptor para manejar errores
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Asegurarse de que error.response existe antes de acceder a sus propiedades
      const status = error?.response?.status;
      const url = error?.config?.url;

      if (status === 401) {
        console.error('Error 401: Token inválido o expirado', {
          url,
          message: error?.response?.data?.message || 'No hay mensaje de error',
        });
      } else if (status === 403) {
        console.error('Error 403: Acceso prohibido', {
          url,
          message: error?.response?.data?.message || 'No hay mensaje de error',
        });
      } else if (status === 404) {
        console.error('Error 404: Recurso no encontrado', {
          url,
          message: error?.response?.data?.message || 'No hay mensaje de error',
        });
      } else {
        console.error(`Error ${status || 'desconocido'}:`, {
          url,
          message: error?.response?.data?.message || error?.message || 'Error desconocido',
        });
      }

      return Promise.reject(error);
    }
  );

  return {
    client,
    setAuth0Client
  };
};

const { client, setAuth0Client } = createClient();
export { client, setAuth0Client };
