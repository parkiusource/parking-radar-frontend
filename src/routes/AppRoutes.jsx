// AppRoutes.js
import { Routes, Route } from "react-router-dom";
import MapPage from "../pages/MapPage";
import HomePage from "../pages/HomePage";
import RegistroAdmin from "../pages/RegisterAdmin";
import PQRSForm from "../pages/PQRSForm";
import Features from "../pages/Features";

const AppRoutes = () => (
  <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/register-admin" element={<RegistroAdmin />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pqrs" element={<PQRSForm />} />
    </Routes>
  </>
);

export default AppRoutes;
