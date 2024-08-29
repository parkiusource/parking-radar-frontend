export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            resolve({ latitude, longitude, accuracy });
          },
          (error) => {
            console.error('Error al obtener la ubicación:', error);
            reject('No se pudo obtener tu ubicación.');
          }
        );
      } else {
        reject('La geolocalización no es compatible con tu navegador.');
      }
    });
  };
