import React, { useCallback, useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocateUserButton from '@/components/LocateUserButton';
import { fetchParkingSpots } from '@/services/ParkingService';

import availableIcon from '@/assets/available-parking.png';
import fullIcon from '@/assets/full-parking.png';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/common';

import { LuNavigation } from 'react-icons/lu';

const TILE_LAYERS = {
  DAY: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2FtaWxvLXBheWFuZW5lIiwiYSI6ImNtMGV1NjdxcDBhOHkybXE0dHZsMmFidjkifQ.cbxHX5muhJt0G7uXU1IgMQ',
};

const userIcon = L.divIcon({
  className: '',
  html: `<div class="user-location-circle"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const getParkingIcon = (availableSpaces) => {
  const iconUrl = availableSpaces > 0 ? availableIcon : fullIcon;
  return L.icon({
    iconUrl,
    iconSize: [35, 45],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

const ZoomToUserLocation = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 16);
    }
  }, [userLocation, map]);

  return null;
};

export function Map({ onParkingSpotSelected }) {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const circleRadius = 20;

  const fetchSpots = useCallback(async () => {
    try {
      const data = await fetchParkingSpots();
      const uniqueData = data.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id),
      );
      setParkingSpots(uniqueData);
    } catch (error) {
      console.error('Error al obtener los parqueaderos:', error);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
    const intervalId = setInterval(fetchSpots, 10000);
    return () => clearInterval(intervalId);
  }, [fetchSpots]);

  const handleLocationFound = (location) => {
    setUserLocation(location);
  };

  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="map-container-wrapper w-full h-full min-h-[400px]">
      <MapContainer
        center={[4.711, -74.0721]}
        zoom={12}
        className="map-container w-full h-full min-h-[400px]"
      >
        <LocateUserButton onLocationFound={handleLocationFound} />
        <TileLayer
          url={TILE_LAYERS.DAY}
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
        />
        {userLocation && (
          <>
            <ZoomToUserLocation userLocation={userLocation} />
            <Circle
              center={userLocation}
              radius={circleRadius}
              className="bg-primary"
              pathOptions={{
                color: '#4285f4',
                fillColor: '#4285f4',
                fillOpacity: 0.15,
                weight: 1.5,
                dashOffset: '2',
              }}
            />
            <Marker position={userLocation} icon={userIcon} />
          </>
        )}
        {parkingSpots.map((spot) => {
          const parkingIcon = getParkingIcon(spot.available_spaces);
          const navigate = () => openNavigation(spot.latitude, spot.longitude);

          return (
            <Marker
              key={spot.id}
              position={[spot.latitude, spot.longitude]}
              icon={parkingIcon}
              eventHandlers={{
                click: () => {
                  if (typeof onParkingSpotSelected === 'function')
                    onParkingSpotSelected({
                      spot,
                      navigate,
                    });
                },
              }}
            >
              <Popup>
                <div className="p-2 text-center space-y-1">
                  <div className="popup-title text-lg font-semibold mb-2">
                    {spot.name}
                  </div>
                  <div>{`Dirección: ${spot.address}`}</div>
                  <div
                    className={twMerge([
                      'font-medium',
                      spot.available_spaces > 0
                        ? 'text-primary'
                        : 'text-red-700',
                      ,
                    ])}
                  >
                    {`Espacios disponibles: ${spot.available_spaces}`}
                  </div>
                  {spot.available_spaces && (
                    <Button
                      className="font-medium mt-4 flex gap-2 items-center mx-auto"
                      onClick={navigate}
                    >
                      <LuNavigation />
                      <span>Navegar</span>
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default Map;
