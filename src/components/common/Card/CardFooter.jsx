import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={twMerge('flex items-center p-6 pt-0', className)}
    >
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.displayName = 'CardFooter';

export default CardFooter;
