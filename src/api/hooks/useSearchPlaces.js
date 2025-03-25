import { useQuery } from '@tanstack/react-query';
import { fetchQuery, Queries, useDebounce } from '@/api/base';
import isEmpty from 'lodash/isEmpty';
import { getQueryConfig } from '@/context/queryClientUtils';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_TEXT_DEBOUNCE = 800; // Aumentado a 800ms para reducir llamadas durante la escritura
const MIN_SEARCH_LENGTH = 3; // Mínimo de caracteres para iniciar búsqueda

/* https://developers.google.com/maps/documentation/places/web-service/text-search#optional-parameters */
const optionalParams = [
  'includedType',
  'languageCode',
  'locationBias',
  'locationRestriction',
  'openNow',
  'minRating',
  'priceLevels',
  'strictTypeFiltering',
  'evOptions',
];

// Función para normalizar el texto de búsqueda (eliminar espacios extra, convertir a minúsculas)
const normalizeText = (text) => {
  if (!text) return '';
  return text.trim().toLowerCase();
};

// Caché local para resultados frecuentes (más rápido que la caché de React Query)
const localCache = new Map();
const MAX_LOCAL_CACHE_SIZE = 20;
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutos

// Función para limpiar entradas expiradas de la caché
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of localCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY) {
      localCache.delete(key);
    }
  }
};

export const useSearchPlaces = (
  textQuery,
  options = { languageCode: 'es' },
) => {
  // Normalizamos el texto para mejorar la coincidencia en caché
  const normalizedText = normalizeText(textQuery);

  // Aplicamos debounce al texto normalizado
  const debouncedTextQuery = useDebounce(normalizedText, DEFAULT_TEXT_DEBOUNCE);

  // Verificar si tenemos el resultado en caché local
  const cacheKey = `${debouncedTextQuery}-${JSON.stringify(options)}`;

  // Limpiar caché expirada periódicamente
  cleanExpiredCache();

  const params = new URLSearchParams({ languageCode: options.languageCode });

  const requestBody = {
    textQuery: debouncedTextQuery,
  };

  optionalParams.forEach((param) => {
    if (options[param] !== undefined) {
      requestBody[param] = options[param];
    }
  });

  /* https://developers.google.com/maps/documentation/places/web-service/text-search#fieldmask */
  const fieldMask = Array.isArray(options.fieldMask)
    ? options.fieldMask.join(',')
    : options.fieldMask ||
      'places.displayName,places.formattedAddress,places.location';

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': fieldMask,
  };

  const query = useQuery({
    queryKey: [Queries.SearchPlaces, debouncedTextQuery, options],
    queryFn: fetchQuery({
      url: 'https://places.googleapis.com/v1/places:searchText',
      method: 'POST',
      data: requestBody,
      headers,
      params,
    }),
    select: (data) => {
      const places = data?.places || [];

      // Guardar en caché local si hay resultados
      if (places.length > 0) {
        // Limitar el tamaño de la caché eliminando entradas antiguas si es necesario
        if (localCache.size >= MAX_LOCAL_CACHE_SIZE) {
          const oldestKey = localCache.keys().next().value;
          localCache.delete(oldestKey);
        }

        localCache.set(cacheKey, {
          data: places,
          timestamp: Date.now()
        });
      }

      return places;
    },
    enabled: !isEmpty(debouncedTextQuery) &&
             !isEmpty(normalizedText) &&
             normalizedText.length >= MIN_SEARCH_LENGTH, // Solo buscar si hay suficientes caracteres
    staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar los datos obsoletos
    cacheTime: 1000 * 60 * 15, // Mantener en caché por 15 minutos
    ...getQueryConfig('googlePlaces'),
    // Si los datos están ya en la caché local y no han expirado, usarlos inmediatamente
    initialData: () => {
      const cached = localCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
        return cached.data;
      }
      return undefined;
    },
  });

  const places = query.data || [];
  return { ...query, results: places, places };
};

export default useSearchPlaces;
