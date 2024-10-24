import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ParkingProvider } from '@/context/ParkingContext';
import { QueryClientContextProvider } from '@/context/QueryClientContext';
import { UserProvider } from '@/context/UserContext';
import AppRoutes from '@/routes/AppRoutes';
import ScrollToTop from '@/services/ScrollToTop';

const App = () => (
  <div className="bg-secondary-950 overflow-scroll relative h-screen no-scrollbar">
    <div className="w-full min-w-screen min-h-screen">
      <QueryClientContextProvider>
        <UserProvider>
          <ParkingProvider>
            <ScrollToTop />
            <AppRoutes />
          </ParkingProvider>
        </UserProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientContextProvider>
    </div>
  </div>
);

export default App;
