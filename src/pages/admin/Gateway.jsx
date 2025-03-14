import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAdminProfile, useAdminParkingLots } from '@/api/hooks/useAdminOnboarding';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { Button } from '@/components/common/Button/Button';
import { LuLogIn } from 'react-icons/lu';

export const Gateway = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, loginWithRedirect } = useAuth0();
  const { data: profile, isLoading: isProfileLoading } = useAdminProfile();
  const { data: parkingLots, isLoading: isParkingLoading } = useAdminParkingLots();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Solo proceder si no estamos cargando nada
      if (!isAuthLoading && !isProfileLoading && !isParkingLoading) {
        console.log('Estado de autenticación:', {
          isAuthenticated,
          profile,
          parkingLots,
        });

        if (isAuthenticated) {
          // Si el perfil está completo y tenemos parqueaderos, ir al dashboard
          if (profile?.isProfileComplete && parkingLots?.length > 0) {
            navigate('/admin/dashboard', { replace: true });
          }
          // Si el perfil no está completo o no hay parqueaderos, ir a onboarding
          else if (!profile?.isProfileComplete || !parkingLots?.length) {
            navigate('/admin/onboarding', { replace: true });
          }
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, isAuthLoading, profile, parkingLots, isProfileLoading, isParkingLoading, navigate]);

  // Mostrar loading mientras se verifica cualquier estado
  if (isAuthLoading || (isAuthenticated && (isProfileLoading || isParkingLoading))) {
    return <LoadingOverlay message="Verificando sesión..." />;
  }

  // Si no está autenticado, mostrar botón de login
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary-950 p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">¡Bienvenido a ParkiÜ!</h1>
          <p className="text-secondary-200 max-w-md">
            Inicia sesión para administrar tus parqueaderos y gestionar tus espacios disponibles.
          </p>
        </div>
        <Button
          onClick={() => {
            console.log('Iniciando login...');
            loginWithRedirect({
              appState: { returnTo: '/admin/onboarding' }
            });
          }}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600"
        >
          <LuLogIn className="w-5 h-5" />
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  return <LoadingOverlay message="Redirigiendo..." />;
};
