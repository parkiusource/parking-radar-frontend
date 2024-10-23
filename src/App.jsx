import AppRoutes from '@/routes/AppRoutes';
import { ParkingProvider } from '@/context/ParkingContext';
import ScrollToTop from '@/services/ScrollToTop';
import { UserProvider } from '@/context/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

const App = () => (
  <div className="bg-secondary-950 overflow-scroll relative h-screen no-scrollbar">
    <div className="w-full min-w-screen min-h-screen">
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ParkingProvider queryClient={queryClient}>
            <ScrollToTop />
            <AppRoutes />
          </ParkingProvider>
        </UserProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  </div>
);

export default App;
