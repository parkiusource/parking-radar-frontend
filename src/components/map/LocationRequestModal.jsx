import PropTypes from 'prop-types';
import { BiTargetLock } from 'react-icons/bi';

export function LocationRequestModal({ onRequestLocation, onSkip }) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <BiTargetLock size={48} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">¿Permitir acceso a tu ubicación?</h3>
          <p className="text-gray-600 mb-6">
            Para encontrar los parqueaderos más cercanos a ti, necesitamos acceder a tu ubicación.
            ¿Deseas permitir el acceso?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onRequestLocation}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Permitir acceso
            </button>
            <button
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Usar ubicación por defecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

LocationRequestModal.propTypes = {
  onRequestLocation: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};
