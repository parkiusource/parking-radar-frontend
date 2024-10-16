import { useEffect, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchParkingSpots } from '../services/ParkingService';
import LocateUserButton from '../components/LocateUserButton';
import availableIcon from '../assets/available-parking.png';
import fullIcon from '../assets/full-parking.png';

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

const TILE_LAYERS = {
  DAY: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2FtaWxvLXBheWFuZW5lIiwiYSI6ImNtMGV1NjdxcDBhOHkybXE0dHZsMmFidjkifQ.cbxHX5muhJt0G7uXU1IgMQ',
};

// eslint-disable-next-line react/prop-types
const ZoomToUserLocation = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 16);
    }
  }, [userLocation, map]);

  return null;
};

const MapPage = () => {
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
    <main className="app-container bg-red-500">
      {/* Contenedor del mapa con borde y sombras */}
      <div className="map-container-wrapper">
        <MapContainer
          center={[4.711, -74.0721]}
          zoom={12}
          className="map-container"
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
                className="user-location-circle-around"
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
            return (
              <Marker
                key={spot.id}
                position={[spot.latitude, spot.longitude]}
                icon={parkingIcon}
              >
                <Popup>
                  <div className="popup-content">
                    <div className="popup-title">{spot.name}</div>
                    <div>{`Dirección: ${spot.address}`}</div>
                    <div
                      className={
                        spot.available_spaces > 0
                          ? 'popup-available'
                          : 'popup-full'
                      }
                    >
                      {`Espacios disponibles: ${spot.available_spaces}`}
                    </div>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() =>
                        openNavigation(spot.latitude, spot.longitude)
                      }
                    >
                      Navegar aquí
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </main>
  );
};

export default MapPage;
