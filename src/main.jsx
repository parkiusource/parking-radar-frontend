import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { register } from "./serviceWorkerRegistration";
// Importar i18n para inicializarlo antes que la aplicación
import './i18n';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar el service worker
register({
  onSuccess: () => console.log('Service Worker registrado con éxito'),
  onUpdate: () => console.log('Nuevo Service Worker disponible')
});
