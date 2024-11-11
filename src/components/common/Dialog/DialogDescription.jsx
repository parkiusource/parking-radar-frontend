import { forwardRef } from 'react';

import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import { Description } from '@radix-ui/react-dialog';

export const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <Description
    ref={ref}
    className={twMerge('text-sm text-muted-foreground', className)}
    {...props}
  />
));

DialogDescription.displayName = Description.displayName;

DialogDescription.propTypes = {
  className: PropTypes.string,
};

export default DialogDescription;
