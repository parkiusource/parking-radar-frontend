import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuMenu, LuX } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LogoutButton } from '@/components/common';

import { CtaButtons } from './CtaButtons';
import { getHeaderClassName } from './getHeaderClassName';

const MobileMenu = memo(({ isOpen, onClose, isAuthenticated, onLogin }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.nav
        className="md:hidden w-full flex flex-col gap-4 pt-4 pb-2"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col gap-2">
          <Link
            to="/about"
            className="text-sm hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-white/10"
            onClick={onClose}
          >
            Nosotros
          </Link>
          <Link
            to="/support"
            className="text-sm hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-white/10"
            onClick={onClose}
          >
            Soporte
          </Link>
          <div className="flex justify-center my-2">
            <LanguageSwitcher />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='flex justify-center pt-2'
        >
          <CtaButtons
            auth={{ isAuthenticated, isLoading: false }}
            onLogin={() => {
              onClose();
              onLogin();
            }}
            className="w-full justify-center"
          />
          {isAuthenticated && (
            <LogoutButton
              variant="text"
              className="w-full justify-center mt-2"
            />
          )}
        </motion.div>
      </motion.nav>
    )}
  </AnimatePresence>
));

MobileMenu.displayName = 'MobileMenu';

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
};

const Header = ({ className }) => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogin = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className={getHeaderClassName({ className })}>
      <div className="w-full flex justify-between items-center">
        <Link to="/" className="flex-shrink-0">
          <Logo className="h-10 md:h-12 w-auto" />
        </Link>

        {/* Botón para mostrar menú en móvil */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex items-center justify-center w-10 h-10 text-white rounded-md hover:bg-white/10 transition-colors"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileMenuOpen ? <LuX size={28} /> : <LuMenu size={28} />}
        </button>

        {/* Navegación de escritorio */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/about" className="text-sm hover:text-primary transition-colors">
          {t('header.menu.aboutUs', 'Nosotros')}
          </Link>
          <Link to="/support" className="text-sm hover:text-primary transition-colors">
          {t('header.menu.support', 'Soporte')}
          </Link>
          <LanguageSwitcher className="mr-2" />
          <CtaButtons
            auth={{ isAuthenticated, isLoading }}
            onLogin={handleLogin}
            className="scale-95 origin-right"
          />
          {isAuthenticated && (
            <LogoutButton variant="icon" />
          )}
        </nav>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
      />
    </header>
  );
};

Header.displayName = 'Header';

Header.propTypes = {
  className: PropTypes.string,
};

const MemoizedHeader = memo(Header);
MemoizedHeader.displayName = 'MemoizedHeader';

export { MemoizedHeader as Header };
