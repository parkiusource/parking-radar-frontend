import { useQuery } from '@tanstack/react-query';
import { fetchQuery, Queries, useDebounce } from '@/api/base';
import isEmpty from 'lodash/isEmpty';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_TEXT_DEBOUNCE = 300;

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

export const useSearchPlaces = (
  textQuery,
  options = { languageCode: 'es' },
) => {
  const debouncedTextQuery = useDebounce(textQuery, DEFAULT_TEXT_DEBOUNCE);
  const params = new URLSearchParams({ languageCode: options.languageCode });

  const requestBody = {
    textQuery: textQuery,
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
    queryKey: [Queries.SearchPlaces, textQuery, options],
    queryFn: fetchQuery({
      url: 'https://places.googleapis.com/v1/places:searchText',
      method: 'POST',
      data: requestBody,
      headers,
      params,
    }),
    select: (data) => data?.places,
    enabled: !isEmpty(debouncedTextQuery) && !isEmpty(textQuery),
  });

  const places = query.data || [];
  return { ...query, results: places, places };
};

export default useSearchPlaces;
