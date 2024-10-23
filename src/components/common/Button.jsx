import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { getButtonClassName } from './buttonUtils';

const Button = forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: variant === 'flat' ? 1.01 : 1.05 }}
        whileTap={{ scale: variant === 'flat' ? 1 : 0.95 }}
      >
        <button
          ref={ref}
          className={getButtonClassName({ className, variant, size })}
          {...props}
        />
      </motion.div>
    );
  }
);

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'flat']),
  size: PropTypes.oneOf(['default', 'sm', 'lg']),
};

Button.displayName = 'Button';

export { Button };
