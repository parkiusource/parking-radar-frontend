// src/services/ParkingService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Función para obtener los datos de los parqueaderos desde el backend
export const getParkingSpots = async () => {
  try {
    const response = await axios.get(`${API_URL}/parking-lots`); // Reemplaza con tu URL de backend
    return response.data;
  } catch (error) {
    console.error('Error al obtener los parqueaderos:', error);
    throw error;
  }
};
