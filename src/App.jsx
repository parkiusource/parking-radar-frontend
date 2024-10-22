import AppRoutes from '@/routes/AppRoutes';
import { ParkingProvider } from '@/context/ParkingContext';
import ScrollToTop from '@/services/ScrollToTop';
import { UserProvider } from '@/context/UserContext';

const App = () => (
  <div className="bg-secondary-950 overflow-scroll relative h-screen no-scrollbar">
    <div className="w-full min-w-screen min-h-screen">
      <UserProvider>
        <ParkingProvider>
          <ScrollToTop />
          <AppRoutes />
        </ParkingProvider>
      </UserProvider>
    </div>
  </div>
);

export default App;
