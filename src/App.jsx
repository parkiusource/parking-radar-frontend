// eslint-disable-next-line no-unused-vars
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppRoutes from './routes/AppRoutes'; // Importa el archivo de rutas
import ScrollToTop from './services/ScrollToTop';
// import './styles/App.css';

const App = () => (
  <div className="App">
    <ScrollToTop />
    <AppRoutes />
  </div>
);

export default App;
