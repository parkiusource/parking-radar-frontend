import { useMemo } from 'react';

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

const haversineDistance = (coords1, coords2) => {
  const EARTH_RADIUS = 6371e3;

  const lat1 = coords1?.lat ?? 0;
  const lng1 = coords1?.lng ?? 0;
  const lat2 = coords2?.lat ?? 0;
  const lng2 = coords2?.lng ?? 0;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
};

const validateCoordinates = (coords) =>
  Number.isFinite(coords?.lat) && Number.isFinite(coords?.lng);

export const useNearbyParkingSpots = ({ spots = [], center, limit = 5, maxRadius = Infinity }) => {
  const nearbySpots = useMemo(() => {
    if (!Array.isArray(spots)) return [];

    if (!validateCoordinates(center)) {
      return spots.slice(0, limit);
    }

    const spotsWithDistance = spots
      .map((spot) => {
        const spotCoordinates = { lat: spot.latitude, lng: spot.longitude };
        const distance = haversineDistance(center, spotCoordinates);
        return { ...spot, distance };
      })
      .filter((spot) => spot.distance <= maxRadius);

    spotsWithDistance.sort((a, b) => a.distance - b.distance);

    return spotsWithDistance.slice(0, limit);
  }, [spots, center, limit, maxRadius]);

  return { nearbySpots };
};

export default useNearbyParkingSpots;
