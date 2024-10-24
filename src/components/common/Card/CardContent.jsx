import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div {...props} className={twMerge('p-6', className)}>
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardContent.displayName = 'CardContent';

export default CardContent;
