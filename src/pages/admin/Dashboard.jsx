import { LuPlus, LuLayoutDashboard, LuParkingSquare, LuSettings, LuLogOut, LuMapPin, LuCar, LuSearch, LuTrendingUp, LuUsers } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

import { Button } from '@/components/common/Button/Button';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

import { useParkingSpots } from '@/api/hooks/useParkingSpots';
import { useCreateParking } from '@/api/hooks/useCreateParking';
import { ParkingCard } from '@/components/admin/ParkingCard';
import { ParkingFormDialog } from '@/components/admin/ParkingForm';
import { Logo } from '@/components/Logo';
import { useQueryClient } from '@/context/queryClientUtils';

// Datos simulados para las métricas
const mockMetrics = {
  weeklyStats: [
    { day: 'Lun', value: 85 },
    { day: 'Mar', value: 92 },
    { day: 'Mie', value: 78 },
    { day: 'Jue', value: 95 },
    { day: 'Vie', value: 88 },
    { day: 'Sab', value: 72 },
    { day: 'Dom', value: 65 },
  ],
  popularHours: [
    { hour: '8:00', occupancy: 75 },
    { hour: '12:00', occupancy: 90 },
    { hour: '16:00', occupancy: 85 },
    { hour: '20:00', occupancy: 60 },
  ],
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, logout } = useAuth0();

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeRange, setTimeRange] = useState('week');

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

  // Función para filtrar parqueaderos
  const filteredParkings = parkingSpots?.filter(parking => {
    const matchesSearch = parking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parking.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' ? true :
                         selectedStatus === 'available' ? parking.availableSpaces > 0 :
                         parking.availableSpaces === 0;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingOverlay message="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    navigate('/admin/gateway', { replace: true });
    return <LoadingOverlay message="Redirigiendo..." />;
  }

  const totalSpaces = parkingSpots?.reduce((acc, spot) => acc + (spot.totalSpaces || 0), 0) || 0;
  const availableSpaces = parkingSpots?.reduce((acc, spot) => acc + (spot.availableSpaces || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="block">
            <Logo variant="secondary" className="w-32" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium"
          >
            <LuLayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/parkings"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LuParkingSquare className="w-5 h-5" />
            <span>Parqueaderos</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LuSettings className="w-5 h-5" />
            <span>Configuración</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user?.picture}
              alt={user?.name}
              className="w-10 h-10 rounded-full border-2 border-gray-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LuLogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header with Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('admin.parkingList.title', 'Tus Parqueaderos')}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Gestiona y monitorea tus espacios de estacionamiento
                  </p>
                </div>

                <ParkingFormDialog
                  title={t('admin.parkingList.addNew.title', 'Añadir un nuevo parqueadero')}
                  description={t('admin.parkingList.addNew.description', 'Ingresa los datos del nuevo parqueadero para añadirlo a tu lista.')}
                  onSubmit={createParking}
                >
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <LuPlus className="mr-2 h-4 w-4" />
                    {t('admin.parkingList.addButton', 'Añadir Nuevo Parqueadero')}
                  </Button>
                </ParkingFormDialog>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar por nombre o dirección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    className="block w-full sm:w-40 py-2 px-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="available">Disponibles</option>
                    <option value="full">Llenos</option>
                  </select>
                  <select
                    className="block w-full sm:w-40 py-2 px-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="day">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <LuParkingSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Parqueaderos</p>
                    <p className="text-2xl font-semibold text-gray-900">{parkingSpots?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <LuCar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Espacios Totales</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalSpaces}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <LuMapPin className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Espacios Disponibles</p>
                    <p className="text-2xl font-semibold text-gray-900">{availableSpaces}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Section */}
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Occupancy Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ocupación Semanal</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <LuTrendingUp className="w-4 h-4" />
                    <span>+12% vs semana anterior</span>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {mockMetrics.weeklyStats.map((stat) => (
                    <div key={stat.day} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-100 rounded-t-lg transition-all duration-300 hover:bg-blue-200"
                        style={{ height: `${stat.value}%` }}
                      />
                      <span className="mt-2 text-xs text-gray-500">{stat.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Hours */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Horas Populares</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <LuUsers className="w-4 h-4" />
                    <span>Promedio diario</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {mockMetrics.popularHours.map((hour) => (
                    <div key={hour.hour} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{hour.hour}</span>
                        <span className="text-gray-900 font-medium">{hour.occupancy}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${hour.occupancy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Parking List with Filtered Results */}
            {filteredParkings?.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <LuParkingSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay parqueaderos'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Comienza añadiendo tu primer parqueadero'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredParkings?.map((parking) => (
                  <ParkingCard key={parking.id} parking={parking} onRefresh={refetch} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
