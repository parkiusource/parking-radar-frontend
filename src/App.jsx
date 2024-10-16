// eslint-disable-next-line no-unused-vars
import React from 'react';
import AppRoutes from '@/routes/AppRoutes'; // Importa el archivo de rutas
import ScrollToTop from '@/services/ScrollToTop';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
