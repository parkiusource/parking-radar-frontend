import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={twMerge('flex flex-col space-y-1.5 p-6', className)}
    >
      {children}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardHeader.displayName = 'CardHeader';

export default CardHeader;
