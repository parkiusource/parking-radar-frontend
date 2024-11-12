import { forwardRef } from 'react';

import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import { Title } from '@radix-ui/react-dialog';

export const DialogTitle = forwardRef(({ className, ...props }, ref) => (
  <Title
    ref={ref}
    className={twMerge(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));

DialogTitle.displayName = Title.displayName;

DialogTitle.propTypes = {
  className: PropTypes.string,
};

export default DialogTitle;
