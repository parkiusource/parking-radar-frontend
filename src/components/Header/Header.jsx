import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

import { CtaButtons } from './CtaButtons';
import { getHeaderClassName } from './getHeaderClassName';

const Header = ({ className }) => {
  const { loginWithLocale, isAuthenticated, isLoading } = useAuth();

  return (
    <header className={getHeaderClassName({ className })}>
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

Header.propTypes = {
  className: PropTypes.string,
};

export { Header };
