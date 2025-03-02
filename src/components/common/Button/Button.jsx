import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';

import { getButtonClassName } from './getButtonClassName';

export const Button = forwardRef(
  ({ className, variant, size, squared, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: variant === 'flat' ? 1.01 : 1.05 }}
        whileTap={{ scale: variant === 'flat' ? 1 : 0.95 }}
      >
        <button
          ref={ref}
          className={getButtonClassName({ className, variant, size, squared })}
          {...props}
        />
      </motion.div>
    );
  },
);

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'flat', 'dark', 'light']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
  squared: PropTypes.bool,
};

Button.displayName = 'Button';

export default Button;
