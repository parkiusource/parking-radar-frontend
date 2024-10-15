import { twMerge } from "tailwind-merge";

const variants = {
  primary: "bg-primary-50 shadow-primary-950"
};

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg"
};

const getCardClassName = ({ className, variant, size }) => {
  return twMerge(["p-8 rounded-lg shadow-lg"], variants[variant], sizes[size], className);
};

export function Card({ children, className, variant = "primary", size = "lg", ...props }) {
  return (
    <div {...props} className={getCardClassName({ className, variant, size })}>
      {children}
    </div>
  );
}

export default Card;
