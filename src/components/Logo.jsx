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
      className={twMerge([
        'w-auto h-12 md:h-16 translate-x-3 sm:translate-x-5 md:translate-x-6',
        className,
      ])}
    />
  );
}

export default Logo;
