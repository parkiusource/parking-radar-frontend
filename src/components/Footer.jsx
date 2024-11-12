import { FaInstagram, FaSquareFacebook } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

const Footer = ({ className }) => (
  <footer
    className={twMerge(
      'w-screen bg-secondary-500 flex flex-col gap-2 items-center p-4 text-white shadow text-center',
      className,
    )}
  >
    <p className="mb-0">&copy; 2024 ParkiÜ. Todos los derechos reservados.</p>
    <div className="text-xl flex items-center gap-4">
      <a
        href="https://www.facebook.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary transition-colors"
      >
        <FaSquareFacebook />
      </a>
      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary transition-colors"
      >
        <FaInstagram />
      </a>
    </div>
  </footer>
);

export default Footer;
