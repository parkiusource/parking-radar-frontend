// components/LocateUserButton.jsx
import { getUserLocation } from '../services/geolocationService';
import PropTypes from 'prop-types';
import { getButtonClassName } from '@/components/common';
import { BiTargetLock } from 'react-icons/bi';
import { twMerge } from 'tailwind-merge';

const LocateUserButton = ({ onLocationFound }) => {
  const handleLocateUser = async () => {
    try {
      const { latitude, longitude, accuracy } = await getUserLocation();
      const location = { lat: latitude, lng: longitude };

      onLocationFound(location, accuracy);
    } catch (error) {
      alert('Error al obtener la ubicación: ' + error.message);
    }
  };

  return (
    <button
      onClick={handleLocateUser}
      className={twMerge(
        getButtonClassName(),
        'absolute top-4 right-4 p-2 rounded-full w-12 h-12 text-2xl',
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
