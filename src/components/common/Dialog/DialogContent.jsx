import { forwardRef } from 'react';

import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';
import {
  Close,
  Content,
  DialogOverlay,
  DialogPortal,
} from '@radix-ui/react-dialog';

export const DialogContent = forwardRef(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <Content
        ref={ref}
        className={twMerge(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          className,
        )}
        {...props}
      >
        {children}
        <Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <LuX className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Close>
      </Content>
    </DialogPortal>
  ),
);

DialogContent.displayName = Content.displayName;

DialogContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default DialogContent;
