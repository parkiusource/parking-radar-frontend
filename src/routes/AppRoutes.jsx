import { Routes, Route } from 'react-router-dom';

import MapPage from '@/pages/MapPage';
import HomePage from '@/pages/HomePage';
import About from '@/pages/About';
import Login from '@/pages/Login';

const AppRoutes = () => (
  <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </>
);

export default AppRoutes;
