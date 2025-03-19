import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Search } from 'lucide-react';
import { CircleParking } from 'lucide-react';
import { Button } from '@/components/common';
import { twMerge } from 'tailwind-merge';
import { useAdminProfile } from '@/api/hooks/useAdminOnboarding';

const CtaButtons = ({ auth: { isAuthenticated, isLoading }, onLogin, className }) => {
  const { data: profile, isLoading: profileLoading } = useAdminProfile();

  const getAdminLink = () => {
    console.log('Profile state:', {
      profile,
      isLoading: profileLoading,
      isProfileComplete: profile?.isProfileComplete,
      hasParking: profile?.hasParking
    });

    if (!profile || profileLoading) {
      console.log('Redirecting to onboarding: No profile or loading');
      return '/admin/onboarding';
    }
    if (profile.isProfileComplete && profile.hasParking) {
      console.log('Redirecting to dashboard: Profile complete and has parking');
      return '/admin/dashboard';
    }
    console.log('Redirecting to onboarding: Incomplete profile or no parking');
    return '/admin/onboarding';
  };

  return (
    <div className={twMerge("flex flex-row gap-2 lg:gap-4 items-center w-full md:w-auto", className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 md:flex-auto"
      >
        <Link to="/parking" className="w-full block">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white border-white hover:bg-white/10"
          >
            <Search className="w-4 h-4 md:w-5 md:h-5" />
            <span className="whitespace-nowrap">Buscar</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 md:flex-auto"
        transition={{  delay: 1 }}
      >
        {isLoading || !isAuthenticated ? (
          <Button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium bg-white text-primary hover:bg-white/90 transition-colors"
            disabled={isLoading}
          >
            <LogIn className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span className="whitespace-nowrap">Administrar</span>
              <span className="text-xs opacity-90">Mi parqueadero</span>
            </div>
          </Button>
        ) : (
          <Link to={getAdminLink()} className="w-full block">
            <Button
              className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium bg-white text-primary hover:bg-white/90"
              disabled={profileLoading}
            >
              <CircleParking className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Mi Panel</span>
            </Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
};

CtaButtons.displayName = 'CtaButtons';

CtaButtons.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export { CtaButtons };
