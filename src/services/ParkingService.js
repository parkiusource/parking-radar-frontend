// src/services/ParkingService.js
import axios from 'axios';

const API_URL = 'https://parking-radar-61e65e5cb889.herokuapp.com';

// Función para obtener los datos de los parqueaderos desde el backend
export const getParkingSpots = async () => {
  try {
    const response = await axios.get(`${API_URL}/parking-lots/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los parqueaderos:', error);
    throw error;
  }
};

export const fetchParkingSpots = async () => {
  try {
    const data = await getParkingSpots();
    return data;
  } catch (error) {
    console.error('Error al obtener los parqueaderos:', error);
    return [];
  }
};
