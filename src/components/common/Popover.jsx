import { forwardRef } from 'react';
import { Close, Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { getPopoverContentClassName } from './utils/popoverUtils';

export const Popover = Root;
export const PopoverClose = Close;
export const PopoverPortal = Portal;
export const PopoverTrigger = Trigger;

export const PopoverContent = forwardRef((props, ref) => (
  <Content
    autoFocus
    ref={ref}
    {...props}
    className={getPopoverContentClassName(props)}
  />
));

PopoverContent.displayName = 'PopoverContent';
