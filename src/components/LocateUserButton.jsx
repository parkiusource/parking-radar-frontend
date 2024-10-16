// components/LocateUserButton.jsx
import { useMap } from 'react-leaflet';
import { getUserLocation } from '../services/geolocationService';
import PropTypes from 'prop-types';
import { getButtonClassName } from '@/components/common';

import { BiTargetLock } from 'react-icons/bi';
import { twMerge } from 'tailwind-merge';

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
      className={twMerge(
        getButtonClassName(),
        'absolute z-[1000] top-4 right-4 p-2 rounded-full w-12 h-12 text-2xl',
      )}
    >
      <BiTargetLock />
    </button>
  );
};

LocateUserButton.propTypes = {
  onLocationFound: PropTypes.func.isRequired,
};

export default LocateUserButton;
