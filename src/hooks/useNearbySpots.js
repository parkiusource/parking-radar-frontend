import { useMemo } from 'react';

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

const haversineDistance = (coords1, coords2) => {
  const EARTH_RADIUS = 6371e3;

  const { lat: lat1, lng: lng1 } = coords1;
  const { lat: lat2, lng: lng2 } = coords2;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = EARTH_RADIUS * c;

  return d;
};

export const useNearbyParkingSpots = ({ spots, center, limit, maxRadius }) => {
  const nearbySpots = useMemo(() => {
    if (!spots || !Array.isArray(spots)) return [];

    if (!center || !center.lat || !center.lng) return spots.slice(0, limit);

    const spotsWithDistance = spots
      .map((spot) => {
        const spotCoordinates = {
          lat: spot.latitude,
          lng: spot.longitude,
        };
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
