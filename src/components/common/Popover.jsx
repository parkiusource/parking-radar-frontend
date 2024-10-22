import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Close, Content, Portal, Root, Trigger } from '@radix-ui/react-popover';

export const Popover = Root;

export const PopoverClose = Close;

export const PopoverPortal = Portal;

export const PopoverTrigger = Trigger;

export const getPopoverContentClassName = ({ className } = {}) =>
  twMerge(
    [
      'flex',
      'flex-col',
      'bg-white',
      'rounded-xl',
      'will-change-[transform,opacity]',
      'data-[state=open]:data-[side=top]:animate-slideDownAndFade',
      'data-[state=open]:data-[side=right]:animate-slideLeftAndFade',
      'data-[state=open]:data-[side=bottom]:animate-slideUpAndFade',
      'data-[state=open]:data-[side=left]:animate-slideRightAndFade',
    ],
    className,
  );

export const PopoverContent = forwardRef((props, ref) => (
  <Content
    autoFocus
    ref={ref}
    {...props}
    className={getPopoverContentClassName(props)}
  />
));

PopoverContent.displayName = 'PopoverContent';
