// components/LocateUserButton.jsx
import { useMap } from 'react-leaflet';
import { getUserLocation } from '../services/geolocationService'; // Importar el servicio de geolocalización
import PropTypes from 'prop-types'; // Importa PropTypes

const LocateUserButton = ({ onLocationFound }) => {
  const map = useMap();

  const handleLocateUser = async () => {
    try {
      const { latitude, longitude, accuracy } = await getUserLocation();
      onLocationFound([latitude, longitude], accuracy); // Llama a la función del componente padre para actualizar la ubicación
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
        backgroundColor: 'white',
        border: '2px solid #007BFF',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Mostrar Mi Ubicación
    </button>
  );
};

// Añadir validación de PropTypes
LocateUserButton.propTypes = {
  onLocationFound: PropTypes.func.isRequired, // Define que 'onLocationFound' es una función requerida
};

export default LocateUserButton;
