import PropTypes from 'prop-types';
import { BiTargetLock } from 'react-icons/bi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';

const debug = (message, data) => {
  if (import.meta.env.DEV) {
    console.log(`📍 [LocationModal] ${message}`, data || '');
  }
};

const getErrorMessage = (error) => {
  if (!error) return null;

  switch (error.message) {
    case 'PERMISSION_DENIED':
      return {
        title: 'Permiso de ubicación denegado',
        message: 'Para encontrar los parqueaderos más cercanos a ti, necesitamos acceso a tu ubicación. Por favor:',
        steps: [
          'Haz clic en el ícono de candado en la barra de direcciones',
          'Busca "Ubicación" en los permisos del sitio',
          'Cambia el permiso a "Permitir"',
          'Recarga la página'
        ]
      };
    case 'POSITION_UNAVAILABLE':
      return {
        title: 'Ubicación no disponible',
        message: 'No pudimos obtener tu ubicación. Por favor:',
        steps: [
          'Verifica que tu GPS esté activado',
          'Asegúrate de estar en un área con buena señal',
          'Intenta nuevamente'
        ]
      };
    case 'TIMEOUT':
      return {
        title: 'Tiempo de espera agotado',
        message: 'La solicitud de ubicación tardó demasiado. Por favor:',
        steps: [
          'Verifica tu conexión a internet',
          'Asegúrate de que tu GPS esté activado',
          'Intenta nuevamente'
        ]
      };
    default:
      return {
        title: 'Error al obtener ubicación',
        message: 'Ocurrió un error al intentar obtener tu ubicación. Por favor:',
        steps: [
          'Verifica que tu navegador soporte geolocalización',
          'Asegúrate de que tu GPS esté activado',
          'Intenta nuevamente'
        ]
      };
  }
};

export function LocationRequestModal({
  onRequestLocation,
  onSkip,
  isLoading = false,
  error = null
}) {
  const errorInfo = getErrorMessage(error);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl transform"
        >
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-xl"></div>
              <div className="relative">
                {isLoading ? (
                  <AiOutlineLoading3Quarters size={64} className="text-primary animate-spin mx-auto" />
                ) : (
                  <BiTargetLock size={64} className="text-primary mx-auto" />
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              {isLoading ? '¡Ya casi!' : '¡Hola! 👋'}
            </h3>

            {errorInfo ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-left mb-6"
              >
                <h4 className="text-lg font-semibold text-red-600 mb-2">{errorInfo.title}</h4>
                <p className="text-gray-600 mb-3">{errorInfo.message}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {errorInfo.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <p className="text-gray-600 mb-8 leading-relaxed">
                {isLoading
                  ? 'Estamos ubicándote para encontrar las mejores opciones...'
                  : '¿Nos permites encontrar los parqueaderos más cercanos a ti?'}
              </p>
            )}

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  debug('Usuario solicitó acceso a ubicación');
                  onRequestLocation();
                }}
                className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold
                         hover:bg-primary-dark transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-primary/30 hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
              >
                {error ? '¡Intentar de nuevo!' : '¡Sí, encontrar parqueaderos!'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  debug('Usuario eligió usar ubicación por defecto');
                  onSkip();
                }}
                className="w-full py-3 px-6 rounded-xl font-medium text-gray-600
                         hover:bg-gray-100 transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Mejor buscar en el centro de Bogotá
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

LocationRequestModal.propTypes = {
  onRequestLocation: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string
  })
};
