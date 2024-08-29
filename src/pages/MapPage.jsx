// components/MapPage.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getParkingSpots } from '../services/ParkingService';
import LocateUserButton from '../components/LocateUserButton'; // Importa el componente de botón
import customIconUrl from '../assets/parking-green.png';

// Definir un icono personalizado para los marcadores de parqueaderos
const icon = L.icon({
  iconUrl: customIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Crear un icono azul similar al de Google Maps
const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#4285f4; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const MapPage = () => {
  const [parkingSpots, setParkingSpots] = useState([]); // Estado para almacenar los datos de los parqueaderos
  const [isNightMode, setIsNightMode] = useState(false); // Estado para controlar el modo noche
  const [userLocation, setUserLocation] = useState(null); // Estado para almacenar la ubicación del usuario
  const [accuracy, setAccuracy] = useState(null); // Estado para almacenar la precisión de la ubicación del usuario

  // Función para obtener datos de parqueaderos del backend
  const fetchParkingSpots = async () => {
    try {
      const data = await getParkingSpots();
      setParkingSpots(data);
    } catch (error) {
      console.error('Error al obtener los parqueaderos:', error);
    }
  };

  // Maneja la ubicación del usuario cuando es encontrada
  const handleLocationFound = (location, accuracy) => {
    setUserLocation(location);
    setAccuracy(accuracy);
  };

  // Configurar polling para obtener datos cada 10 segundos
  useEffect(() => {
    fetchParkingSpots();

    const intervalId = setInterval(() => {
      fetchParkingSpots();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
  };

  const dayTileLayer = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const nightTileLayer = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Botón para alternar entre modos */}
      <button onClick={toggleNightMode} style={{ position: 'absolute', zIndex: 1000, top: '10px', right: '10px' }}>
        {isNightMode ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
      </button>

      <MapContainer center={[4.711, -74.0721]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <LocateUserButton onLocationFound={handleLocationFound} />

        <TileLayer
          url={isNightMode ? nightTileLayer : dayTileLayer}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Agregar un círculo y un marcador en la ubicación actual del usuario */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={accuracy}
              pathOptions={{ color: '#4285f4', fillColor: '#4285f4', fillOpacity: 0.2 }}
            />
            <Marker position={userLocation} icon={userIcon} />
          </>
        )}

        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={icon}
          >
            <Popup>
              {`Parqueadero: ${spot.name}`} <br />
              {`Estado: ${spot.status}`}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
