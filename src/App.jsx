import AppRoutes from '@/routes/AppRoutes';
import ScrollToTop from '@/services/ScrollToTop';
import Header from '@/components/Header';


const App = () => (
  <div className="bg-secondary-950 overflow-scroll relative h-screen no-scrollbar">
    <div className="w-full min-w-screen min-h-screen">
      <Header />
      <ScrollToTop />
      <AppRoutes />
    </div>
  </div>
);

export default App;
