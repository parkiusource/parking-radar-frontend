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
      className={twMerge(['w-10 h-auto app-logo', className])}
    />
  );
}

export default Logo;
