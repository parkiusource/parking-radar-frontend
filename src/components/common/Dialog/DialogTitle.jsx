import { forwardRef } from 'react';

import { Title } from '@radix-ui/react-dialog';
import { twMerge } from 'tailwind-merge';

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

export default DialogTitle;
