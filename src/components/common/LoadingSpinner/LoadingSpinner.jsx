import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      role="status"
      className={twMerge('flex items-center justify-center', className)}
      aria-label="Cargando contenido"
    >
      <div
        className={twMerge(
          'animate-spin rounded-full border-4 border-primary-200 border-t-primary-600',
          sizeClasses[size]
        )}
      />
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default LoadingSpinner;
