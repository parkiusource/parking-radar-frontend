import { useQuery } from '@tanstack/react-query';
import { fetchQuery, Queries, useDebounce } from '@/api/base';
import isEmpty from 'lodash/isEmpty';
import { CACHE_CONFIG } from '@/context/queryClientUtils';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_TEXT_DEBOUNCE = 500; // Aumentado a 500ms para reducir llamadas durante la escritura

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

  const params = new URLSearchParams({ languageCode: options.languageCode });

  const requestBody = {
    textQuery: debouncedTextQuery, // Usamos el texto con debounce para la petición
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

        localCache.set(cacheKey, places);
      }

      return places;
    },
    enabled: !isEmpty(debouncedTextQuery) && !isEmpty(normalizedText),
    // Usamos la configuración de caché específica para búsquedas de lugares
    staleTime: CACHE_CONFIG.SearchPlaces.staleTime,
    cacheTime: CACHE_CONFIG.SearchPlaces.cacheTime,
    // Evitar refetch innecesarios durante cambios de foco
    refetchOnWindowFocus: false,
    // Si los datos están ya en la caché local, usarlos inmediatamente
    initialData: () => {
      return localCache.get(cacheKey);
    },
  });

  const places = query.data || [];
  return { ...query, results: places, places };
};

export default useSearchPlaces;
