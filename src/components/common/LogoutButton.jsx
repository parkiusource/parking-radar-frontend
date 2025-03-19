import { useState, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

const buttonStyles = {
  icon: 'p-2 rounded-full hover:bg-white/10 transition-colors',
  text: 'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors'
};

const LogoutButtonComponent = ({ className, variant = 'icon' }) => {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Limpiar el cache de react-query
      await queryClient.clear();
      // Limpiar localStorage
      localStorage.clear();
      // Hacer logout
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoading(false);
      setShowConfirm(false);
    }
  }, [logout, queryClient]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const handleShowConfirm = useCallback(() => {
    setShowConfirm(true);
  }, []);

  return (
    <>
      <button
        onClick={handleShowConfirm}
        className={twMerge(buttonStyles[variant], className)}
        disabled={isLoading}
        aria-label="Cerrar sesión"
      >
        <LogOut className={variant === 'icon' ? 'w-5 h-5' : 'w-4 h-4'} />
        {variant === 'text' && <span>Cerrar sesión</span>}
      </button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
              className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Cerrar sesión?
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas cerrar tu sesión? Necesitarás volver a iniciar sesión para acceder a tu cuenta.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Cerrando sesión...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

LogoutButtonComponent.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['icon', 'text'])
};

LogoutButtonComponent.displayName = 'LogoutButton';

export const LogoutButton = memo(LogoutButtonComponent);
