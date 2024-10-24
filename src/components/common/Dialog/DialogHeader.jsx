import { twMerge } from 'tailwind-merge';

export const DialogHeader = ({ className, ...props }) => (
  <div
    className={twMerge(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);

DialogHeader.displayName = 'DialogHeader';

export default DialogHeader;
