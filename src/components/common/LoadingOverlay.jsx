import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export function LoadingOverlay({ message = 'Cargando...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-gray-700 text-lg font-medium">{message}</p>
      </div>
    </motion.div>
  );
}

LoadingOverlay.propTypes = {
  message: PropTypes.string,
};
