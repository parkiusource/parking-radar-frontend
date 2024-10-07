import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import MapPage from '../pages/MapPage';
import Info from '../pages/Info';
//import Login from '../pages/Login';
//import Register from '../pages/Register';

const AppRoutes = () => (
  <Routes>
    <Route path="/info" element={<Info />} />
    <Route path="/" element={<Home />} />
    <Route path="/map" element={<MapPage />} />
  </Routes>
);

export default AppRoutes;
