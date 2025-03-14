import { twMerge } from 'tailwind-merge';

import primary from '@/assets/logo/primary.svg';
import secondary from '@/assets/logo/secondary.svg';

const logos = {
  primary,
  secondary,
};

export function Logo({ className, variant = 'primary' }) {
  return (
    <img
      src={logos[variant]}
      alt="Logo"
      width="auto"
      height="auto"
      className={twMerge([
        'w-auto h-10 md:h-12 translate-x-0 sm:translate-x-1 md:translate-x-2',
        className,
      ])}
    />
  );
}

export default Logo;
