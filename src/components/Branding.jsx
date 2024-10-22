import { twMerge } from 'tailwind-merge';

import Logo from '@/components/Logo';

export function Branding({ className = 'primary', variant }) {
  const variants = {
    primary: 'text-primary',
    secondary: 'text-secondary',
  };

  return (
    <div
      className={twMerge(
        'font-medium text-2xl flex items-center gap-2',
        variants[variant],
        className,
      )}
    >
      <Logo variant={variant} />
      <span className="translate-y-1">Parkify</span>
    </div>
  );
}

export default Branding;
