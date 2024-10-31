import { Button } from '@/components/common';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useAuth0 } from '@auth0/auth0-react';
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

const CtaButtons = ({ auth: { isAuthenticated, isLoading }, onLogin }) => {
  return (
    <div className="flex gap-4">
      <Link to="/parking">
        <Button variant="outline">Encuentra tu parqueadero</Button>
      </Link>
      {isLoading || !isAuthenticated ? (
        <Button
          onClick={onLogin}
          className="flex-col px-6 py-2 leading-none"
          disabled={isLoading}
        >
          <span className="uppercase text-xs">Inicia sesión</span>
          <span className="text-[0.6rem] text-secondary-200">
            Y administra tus espacios
          </span>
        </Button>
      ) : (
        <Link to="/admin">
          <Button>Administra tus espacios</Button>
        </Link>
      )}
    </div>
  );
};

const Header = ({ className }) => {
  const { loginWithLocale, isAuthenticated, isLoading } = useAuth();

  return (
    <header className={getHeaderclassName({ className })}>
      <div className="flex gap-6">
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <Link to="/about" className="hover:text-primary transition-colors">
          Nosotros
        </Link>
        <Link to="/pqrs" className="hover:text-primary transition-colors">
          PQRS
        </Link>
        <CtaButtons
          auth={{ isAuthenticated, isLoading }}
          onLogin={loginWithLocale}
        />
      </nav>
      <nav className="flex md:hidden items-center gap-8">
        <CtaButtons
          auth={{ isAuthenticated, isLoading }}
          onLogin={loginWithLocale}
        />
      </nav>
    </header>
  );
};

export default Header;
