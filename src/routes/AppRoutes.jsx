// AppRoutes.js
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import MapPage from '../pages/MapPage';
import HomePage from '../pages/HomePage';
import RegistroAdmin from '../pages/RegisterAdmin';
import PQRSForm from '../pages/PQRSForm';
import Features from '../pages/Features';

const AppRoutes = () => (
  <>
    <Header />
    <Menu />
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/register-admin" element={<RegistroAdmin/>} />
        <Route path="/features" element={<Features/>} />
        <Route path="/pqrs" element={<PQRSForm/>} />
      </Routes>
    </div>
    <Footer />
  </>
);

export default AppRoutes;
