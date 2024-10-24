import { twMerge } from 'tailwind-merge';

export const DialogFooter = ({ className, ...props }) => (
  <div
    className={twMerge(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);

DialogFooter.displayName = 'DialogFooter';

export default DialogFooter;
