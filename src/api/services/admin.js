import { client } from '../client';

// Obtener perfil del administrador
export const getAdminProfile = async (token) => {
  const response = await client.get('/admins/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Completar perfil del administrador (Primer paso del onboarding)
export const completeAdminProfile = async (formData, token) => {
  // Convertir FormData a objeto JSON si es necesario
  const data = {};
  formData.forEach((value, key) => {
    if (key === 'photo_url' && value instanceof File) {
      // Mantener el archivo como está para el FormData
      data[key] = value;
    } else {
      data[key] = value;
    }
  });

  // Si hay un archivo de foto, usar FormData
  if (data.photo_url instanceof File) {
    const response = await client.post('/admins/complete-profile', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Si no hay archivo de foto, enviar como JSON
  const response = await client.post('/admins/complete-profile', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Obtener parqueaderos del administrador
export const getParkingLots = async (token) => {
  const response = await client.get('/admins/parking-lots', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Registrar nuevo parqueadero
export const registerParkingLot = async (parkingData, token) => {
  const response = await client.post('/admins/parking-lots', parkingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Obtener estado del onboarding
export const getOnboardingStatus = async (token) => {
  const response = await client.get('/admins/onboarding', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Actualizar paso del onboarding
export const updateOnboardingStep = async (token, step) => {
  const response = await client.put('/admins/onboarding', { step }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export async function createParking(token, data) {
  const response = await client.post('/parking-lots/', {
    ...data,
    available_spots: data.totalSpots,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
