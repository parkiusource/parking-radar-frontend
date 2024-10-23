import { Branding } from '@/components/Branding';
import { Button } from '@/components/common';
import { FaInstagram, FaSquareFacebook } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export const getHeaderclassName = ({ className }) => {
  return twMerge([
    'fixed top-0 z-10',
    'w-full min-h-20 p-4',
    'bg-secondary shadow-md',
    'flex justify-between items-center',
    'text-white',
    className,
  ]);
};

const CtaButton = () => {
  return (
    <Link to="/parking">
      <Button>Inicia ahora</Button>
    </Link>
  );
};

const Header = ({ className }) => (
  <header className={getHeaderclassName({ className })}>
    <Link to="/">
      <Branding />
    </Link>

    <nav className="hidden md:flex items-center gap-8">
      <Link to="/about" className="hover:text-primary transition-colors">
        Nosotros
      </Link>
      <Link to="/pqrs" className="hover:text-primary transition-colors">
        PQRS
      </Link>
      <CtaButton />

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
    </nav>
    <nav className="flex md:hidden items-center gap-8">
      <CtaButton />
    </nav>
  </header>
);

export default Header;
