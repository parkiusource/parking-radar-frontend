import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { LuWifiOff, LuWifi } from 'react-icons/lu';

export function ConnectionMessage({ show, isConnected }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {isConnected ? (
              <>
                <LuWifi className="w-5 h-5" />
                <span>Conectado al servidor</span>
              </>
            ) : (
              <>
                <LuWifiOff className="w-5 h-5" />
                <span>Desconectado del servidor</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ConnectionMessage.propTypes = {
  show: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
};
