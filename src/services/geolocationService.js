export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      // Mostrar mensaje de explicación antes de solicitar permisos
      console.info("Solicitando ubicación aproximada para mostrar parqueaderos cercanos");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({ latitude, longitude, accuracy });
        },
        (error) => {
          console.error('Error getting the current location:', error);
          reject('Unable to get the current location.');
        },
        {
          enableHighAccuracy: false, // Usamos ubicación aproximada para ahorrar batería
          timeout: 8000, // 8 segundos máximo de espera
          maximumAge: 60000 // Podemos usar una ubicación de hasta 1 minuto de antigüedad
        }
      );
    } else {
      reject('Geolocation is not current compatible with your browser.');
    }
  });
};
