// components/LocateUserButton.jsx
import { useMap } from 'react-leaflet';
import { getUserLocation } from '../services/geolocationService';
import PropTypes from 'prop-types';
import locationIcon from '../assets/location-icon.svg'; // Asegúrate de tener un icono de ubicación en tu carpeta de assets

const LocateUserButton = ({ onLocationFound }) => {
  const map = useMap();

  const handleLocateUser = async () => {
    try {
      const { latitude, longitude, accuracy } = await getUserLocation();
      onLocationFound([latitude, longitude], accuracy); // Actualiza la ubicación
      map.setView([latitude, longitude], 13); // Centra el mapa en la ubicación del usuario
    } catch (error) {
      alert(error);
    }
  };

  return (
    <button
      onClick={handleLocateUser}
      style={{
        position: 'absolute',
        zIndex: 1000,
        top: '50px',
        right: '10px',
        padding: '10px',
        backgroundColor: '#007BFF', // Fondo azul para mejor visibilidad
        border: 'none', // Sin bordes
        borderRadius: '50%', // Hacer el botón redondo
        width: '50px', // Ancho del botón
        height: '50px', // Altura del botón
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Añadir sombra para dar un efecto elevado
        cursor: 'pointer',
        transition: 'background-color 0.3s ease', // Efecto de transición al cambiar color
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')} // Cambiar el color al pasar el mouse
      onMouseLeave={(e) => (e.target.style.backgroundColor = '#007BFF')} // Restaurar el color al salir del mouse
    >
      <img src={locationIcon} alt="Ubicación" style={{ width: '20px', height: '20px' }} />
    </button>
  );
};

LocateUserButton.propTypes = {
  onLocationFound: PropTypes.func.isRequired,
};

export default LocateUserButton;
