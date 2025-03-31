import { twMerge } from 'tailwind-merge';

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
