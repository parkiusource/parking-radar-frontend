// AppRoutes.js
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import MapPage from '../pages/MapPage';
import HomePage from '../pages/HomePage';
import RegistroAdmin from '../pages/RegisterAdmin';

const AppRoutes = () => (
  <>
    <Header />
    <Menu />
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/register-admin" element={<RegistroAdmin/>} />
      </Routes>
    </div>
    <Footer />
  </>
);

export default AppRoutes;
