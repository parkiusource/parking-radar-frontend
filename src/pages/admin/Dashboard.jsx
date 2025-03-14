import { LuPlus } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';

import { Button } from '@/components/common/Button/Button';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

import { useParkingSpots } from '@/api/hooks/useParkingSpots';
import { useCreateParking } from '@/api/hooks/useCreateParking';
import { ParkingCard } from '@/components/admin/ParkingCard';
import { ParkingFormDialog } from '@/components/admin/ParkingForm';
import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { useQueryClient } from '@/context/queryClientUtils';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();

  const queryClient = useQueryClient();
  const { parkingSpots, invalidate, refetch } = useParkingSpots({
    queryClient,
    enabled: isAuthenticated && !isLoading,
  });
  const { createParking } = useCreateParking({
    onSuccess: () => {
      invalidate();
      refetch();
    },
  });

  // Si está cargando, mostrar loading
  if (isLoading) {
    return <LoadingOverlay message="Verificando sesión..." />;
  }

  // Si no está autenticado, redirigir al gateway
  if (!isAuthenticated) {
    navigate('/admin/gateway', { replace: true });
    return <LoadingOverlay message="Redirigiendo..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col">
      <header
        className={getHeaderClassName({
          className: 'gap-6 bg-white sticky md:relative top-0 z-10',
        })}
      >
        <Link to="/">
          <Logo variant="secondary" />
        </Link>
      </header>
      <main className="self-center gap-4 p-4 mt-1 max-w-4xl w-full">
        <section className="p-8 bg-white rounded-xl shadow-sm overflow-hidden space-y-6 min-w-96">
          <div className="flex w-full justify-between items-center">
            <h1 className="text-2xl">{t('admin.parkingList.title', 'Tus Parqueaderos')}</h1>
            <ParkingFormDialog
              title={t('admin.parkingList.addNew.title', 'Añadir un nuevo parqueadero')}
              description={t('admin.parkingList.addNew.description', 'Ingresa los datos del nuevo parqueadero para añadirlo a tu lista.')}
              onSubmit={createParking}
            >
              <Button className="bg-primary-500 hover:bg-primary-600">
                <LuPlus className="mr-2 h-4 w-4" /> {t('admin.parkingList.addButton', 'Añadir Nuevo Parqueadero')}
              </Button>
            </ParkingFormDialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingSpots?.map((parking) => (
              <ParkingCard parking={parking} key={parking.id} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
