import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-primary-100 text-primary-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
      },
      size: {
        default: "px-3 py-1 text-xs",
        small: "px-2 py-0.5 text-xs",
        large: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  size,
  children,
  ...props
}) {
  return (
    <span
      className={badgeVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['default', 'small', 'large']),
  children: PropTypes.node.isRequired,
};
