import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

const variants = {
  inherit: 'bg-inherit border-gray-200',
  primary: 'bg-primary border-primary-200',
  secondary: 'bg-secondary border-secondary-700',
  white: 'bg-white border-primary-200',
};

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  xxl: 'max-w-2xl',
};

const getCardClassName = ({ className, variant, size }) => {
  return twMerge(
    ['rounded-xl shadow border'],
    variants[variant],
    sizes[size],
    className,
  );
};

export const Card = ({
  children,
  className,
  variant = 'inherit',
  size = 'lg',
  ...props
}) => {
  return (
    <div {...props} className={getCardClassName({ className, variant, size })}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['inherit', 'primary', 'secondary','white']),
  size: PropTypes.oneOf(['sm', 'md', 'lg','xl','xxl']),
};

Card.displayName = 'Card';

export default Card;
