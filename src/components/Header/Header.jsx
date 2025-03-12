import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuMenu, LuX } from 'react-icons/lu';

import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

import { CtaButtons } from './CtaButtons';
import { getHeaderClassName } from './getHeaderClassName';

const Header = ({ className }) => {
  const { loginWithLocale, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

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
            Nosotros
          </Link>
          <Link to="/support" className="text-sm hover:text-primary transition-colors">
            Soporte
          </Link>
          <CtaButtons
            auth={{ isAuthenticated, isLoading }}
            onLogin={loginWithLocale}
            className="scale-95 origin-right"
          />
        </nav>
      </div>

      {/* Menú móvil con animación */}
      <AnimatePresence>
        {mobileMenuOpen && (
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
                onClick={() => setMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                to="/support"
                className="text-sm hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                support
              </Link>
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className='flex justify-center pt-2'
              >
              <CtaButtons
                auth={{ isAuthenticated, isLoading }}
                onLogin={() => {
                  setMobileMenuOpen(false);
                  loginWithLocale();
                }}
                className="w-full justify-center"
              />
              </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export { Header };
