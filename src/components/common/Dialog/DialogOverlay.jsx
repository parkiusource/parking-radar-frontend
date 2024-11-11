import { forwardRef } from 'react';

import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import { Overlay } from '@radix-ui/react-dialog';

export const DialogOverlay = forwardRef(({ className, ...props }, ref) => (
  <Overlay
    ref={ref}
    className={twMerge(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));

DialogOverlay.displayName = Overlay.displayName;

DialogOverlay.propTypes = {
  className: PropTypes.string,
};

export default DialogOverlay;
