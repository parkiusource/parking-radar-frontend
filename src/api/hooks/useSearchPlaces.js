import { useState, useEffect } from 'react';

import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const useSearchPlaces = (textQuery, options = {}) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!textQuery) return;

    setLoading(true);
    setError(null);

    const requestBody = {
      textQuery: textQuery,
    };

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

    optionalParams.forEach((param) => {
      if (options[param] !== undefined) {
        requestBody[param] = options[param];
      }
    });

    if (!API_KEY) {
      setError(new Error('Missing API Key'));
      setLoading(false);
      return;
    }

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

    axios
      .post(
        'https://places.googleapis.com/v1/places:searchText?languageCode=es',
        requestBody,
        {
          headers: headers,
        },
      )
      .then((response) => {
        setPlaces(response.data.places || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [textQuery, options]);

  return { places, results: places, loading, error };
};

export default useSearchPlaces;
