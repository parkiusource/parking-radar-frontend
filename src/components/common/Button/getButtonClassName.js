import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const variants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-sky-500 text-white hover:bg-sky-600 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-sky-500 text-sky-500 hover:bg-sky-50',
        ghost: 'text-sky-500',
        flat: 'rounded-none bg-transparent text-secondary hover:bg-sky-50 shadow-none',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8 text-base',
        icon: 'p-2 rounded',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export const getButtonClassName = ({
  className,
  variant = 'default',
  size = 'default',
}) => {
  return twMerge(
    variants({ variant, size }),
    className,
    'transition-all duration-300 ease-in-out',
    variant !== 'ghost' ? 'hover:translate-y-[-2px]' : '',
  );
};

export default getButtonClassName;
