import axios from 'axios';

const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID;

const getAuth0Token = () => {
  // Buscar la clave que contiene el token de Auth0
  const auth0Key = Object.keys(localStorage).find(key =>
    key.startsWith('@@auth0spajs@@') &&
    key.includes(AUTH0_CLIENT_ID)
  );

  if (!auth0Key) {
    console.error('No se encontró la clave del token de Auth0 en localStorage');
    return null;
  }

  try {
    const tokenData = JSON.parse(localStorage.getItem(auth0Key));

    // Debug de la estructura completa del token
    console.log('Estructura del token:', tokenData);

    // Extraer el id_token directamente
    if (tokenData?.id_token) {
      return tokenData.id_token;
    }

    // Si no está en la raíz, buscar en la estructura anidada
    if (tokenData?.decodedToken?.id_token) {
      return tokenData.decodedToken.id_token;
    }

    // Si está en la estructura que vemos en la consola
    if (tokenData?.body?.id_token) {
      return tokenData.body.id_token;
    }

    console.error('No se encontró el id_token en el formato esperado:', tokenData);
    return null;
  } catch (error) {
    console.error('Error al parsear el token de Auth0:', error);
    return null;
  }
};

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

      // Obtener un token fresco usando getAccessTokenSilently
      const token = await auth0Client.getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH_AUDIENCE,
      });

      if (!token) {
        console.error('No se pudo obtener el token de Auth0');
        return Promise.reject(new Error('No token available'));
      }

      // Debug
      console.log('URL de la petición:', config.url);
      console.log('Token obtenido:', token.substring(0, 50) + '...');

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
      if (error.response?.status === 401) {
        console.error('Error 401: Token inválido o expirado', {
          url: error.config?.url,
          headers: error.config?.headers,
        });
      } else if (error.response?.status === 403) {
        console.error('Error 403: Acceso prohibido', {
          url: error.config?.url,
          headers: error.config?.headers,
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
