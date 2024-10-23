// src/services/ParkingService.js
import axios from 'axios';

const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

export const getParkingSpots = async () => {
  try {
    const response = await axios.get(`${API_BACKEND_URL}/parking-lots/`);
    return response.data;
  } catch (error) {
    console.error('Error getting the parking spots:', error);
    throw error;
  }
};

export const fetchParkingSpots = async () => {
  try {
    const data = await getParkingSpots();
    return data;
  } catch (error) {
    console.error('Error getting the parking spots:', error);
    return [];
  }
};
