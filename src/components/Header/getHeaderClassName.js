import { twMerge } from 'tailwind-merge';

const getHeaderClassName = ({ className }) => {
  return twMerge([
    'fixed top-0 z-10',
    'w-full min-h-20 p-4',
    'bg-secondary shadow-md',
    'flex justify-between items-center gap-x-4',
    'text-white',
    className,
  ]);
};

export { getHeaderClassName };