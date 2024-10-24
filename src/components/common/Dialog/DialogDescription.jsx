import { forwardRef } from 'react';

import { Description } from '@radix-ui/react-dialog';
import { twMerge } from 'tailwind-merge';

export const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <Description
    ref={ref}
    className={twMerge('text-sm text-muted-foreground', className)}
    {...props}
  />
));

DialogDescription.displayName = Description.displayName;

export default DialogDescription;
