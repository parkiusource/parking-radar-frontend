import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAdminProfile, useAdminParkingLots } from '@/api/hooks/useAdminOnboarding';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { Button } from '@/components/common/Button/Button';
import { LuLogIn, CircleParking } from 'lucide-react';
import { Logo } from '@/components/Logo';

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
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <Logo variant="white" className="mx-auto w-48 mb-8" />

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-8">
                Panel de Administración
              </h1>

              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-4 text-white/80">
                  <CircleParking className="w-6 h-6" />
                  <span>Gestiona tus parqueaderos de forma eficiente</span>
                </div>

                <Button
                  onClick={() => {
                    loginWithRedirect({
                      appState: { returnTo: '/admin/onboarding' }
                    });
                  }}
                  className="flex items-center gap-2 bg-white text-primary-900 hover:bg-white/90 px-8 py-3 text-base font-semibold shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  <LuLogIn className="w-5 h-5" />
                  Iniciar Sesión
                </Button>

                <p className="text-sm text-white/60">
                  Accede a todas las funcionalidades de administración
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-500 to-primary-300 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingOverlay message="Redirigiendo..." />;
};
