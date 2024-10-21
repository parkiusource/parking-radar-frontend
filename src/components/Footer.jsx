import { twMerge } from 'tailwind-merge';

const Footer = ({ className }) => (
  <footer
    className={twMerge(
      'w-screen bg-secondary-500 flex flex-col gap-2 items-center p-4 text-white shadow text-center',
      className,
    )}
  >
    <p className="mb-0">
      &copy; 2024 Smart Parking Radar. Todos los derechos reservados.
    </p>
    <div className="flex gap-2 items-center">
    </div>
  </footer>
);

export default Footer;
