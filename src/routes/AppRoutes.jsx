import { Route, Routes } from 'react-router-dom';

import About from '@/pages/About';
import Admin from '@/pages/Admin';
import Features from '@/pages/Features';
import HomePage from '@/pages/HomePage';
import Parking from '@/pages/Parking';
import PQRSForm from '@/pages/PQRSForm';

const AppRoutes = () => (
  <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/features" element={<Features />} />
      <Route path="/parking" element={<Parking />} />
      <Route path="/pqrs" element={<PQRSForm />} />
    </Routes>
  </>
);

export default AppRoutes;
