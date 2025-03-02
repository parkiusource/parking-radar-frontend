import { twMerge } from 'tailwind-merge';

const getHeaderClassName = ({ className, showShadow = true }) => {
  return twMerge([
    'fixed top-0 z-50',
    'w-full',
    'min-h-[60px] md:min-h-[64px]',
    'px-3 sm:px-4 md:px-5 lg:px-6',
    'py-1 md:py-1.5',
    'bg-secondary',
    showShadow ? 'shadow-md' : '',
    'flex flex-col justify-between items-center',
    'text-white',
    'transition-all duration-200',
    className,
  ]);
};

export { getHeaderClassName };
