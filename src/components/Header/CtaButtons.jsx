import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuParkingSquare, LuLogIn, LuSearch } from 'react-icons/lu';
import { Button } from '@/components/common';
import { twMerge } from 'tailwind-merge';

const CtaButtons = ({ auth: { isAuthenticated, isLoading }, onLogin, className }) => {
  return (
    <div className={twMerge("flex flex-row gap-2 lg:gap-4 items-center w-full md:w-auto", className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 md:flex-auto"
      >
        <Link to="/parking" className="w-full block">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white border-white hover:bg-white/10"
          >
            <LuSearch className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">Buscar</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 md:flex-auto"
      >
        {isLoading || !isAuthenticated ? (
          <Button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium bg-white text-primary hover:bg-white/90 transition-colors"
            disabled={isLoading}
          >
            <LuLogIn className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span className="whitespace-nowrap">Registrar</span>
              <span className="text-xs opacity-90">Mi parqueadero</span>
            </div>
          </Button>
        ) : (
          <Link to="/admin" className="w-full block">
            <Button
              className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium bg-white text-primary hover:bg-white/90"
            >
              <LuParkingSquare className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Mi Panel</span>
            </Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
};

CtaButtons.displayName = 'CtaButtons';

CtaButtons.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export { CtaButtons };
