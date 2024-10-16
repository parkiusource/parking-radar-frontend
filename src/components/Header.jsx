import { Button } from '@/components/common';
import Logo from '@/components/Logo';
import { FaInstagram, FaSquareFacebook } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const getHeaderclassName = ({ className } = {}) => {
  return twMerge([
    'fixed top-0 z-10',
    'w-full h-16 p-4', // Ajusté la altura a h-16 para un tamaño más compacto
    'bg-secondary shadow-md', // Añadí una sombra para mayor contraste
    'flex justify-between items-center',
    'text-white',
    className,
  ]);
};

const Header = () => (
  <header className={getHeaderclassName()}>
    <Link className="font-medium text-2xl flex items-center gap-2" to="/">
      <Logo />
      <span className="translate-y-1">Parkify</span>
    </Link>

    <nav className="hidden md:flex items-center gap-8">
      <Link to="/about" className="hover:text-primary transition-colors">
        Nosotros
      </Link>
      <Link to="/pqrs" className="hover:text-primary transition-colors">
        PQRS
      </Link>
      <Link to="/parking">
        <Button>Inicia ahora</Button>
      </Link>

      <div className="text-xl flex items-center gap-4">
        <a
          href="https://www.facebook.com/profile.php?id=100009699556618"
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
  </header>
);

export default Header;
