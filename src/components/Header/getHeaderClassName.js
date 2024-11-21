import { twMerge } from 'tailwind-merge';

const getHeaderClassName = ({ className }) => {
  return twMerge([
    'fixed top-0 z-10',
    'w-full min-h-16 md:min-h-20',
    'px-4 md:px-5 lg:px-6',
    'py-2 md:py-3 lg:py-4',
    'bg-secondary shadow-md',
    'flex flex-col md:flex-row justify-between items-center gap-x-4',
    'text-white',
    'gap-4 md:gap-6 lg:gap-8',
    className,
  ]);
};


export { getHeaderClassName };
