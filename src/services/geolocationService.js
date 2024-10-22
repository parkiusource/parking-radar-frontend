export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({ latitude, longitude, accuracy });
        },
        (error) => {
          console.error('Error getting the current location:', error);
          reject('Unable to get the current location.');
        },
      );
    } else {
      reject('Geolocation is not current compatible with your browser.');
    }
  });
};
