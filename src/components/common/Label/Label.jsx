import * as React from 'react';

import { Root } from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <Root ref={ref} className={twMerge(labelVariants(), className)} {...props} />
));

Label.displayName = Root.displayName;

export default Label;
