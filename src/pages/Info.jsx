import React from 'react';
import './Info.css';

const Info = () => {
  return (
    <div className="info-container">
      <h2>Bienvenido a la Información de la Plataforma</h2>
      
      <div className="info-section">
        <img src="src/images/information.jpg" alt="Mapa de Bogotá" />
        <p>Te damos la bienvenida a la ventana de información de nuestra plataforma de monitoreo de parqueaderos.</p>
      </div>

      <div className="info-section">
        <p>Utiliza la vista de mapa para ver no solo un estacionamiento sino también los que se encuentren en sus alrededores. Con ésto podrás encontrar alternativas cercanas si este lugar está ocupado.</p>
        <img src="src/images/bogotaCity2.jpg" alt="Mapa de Bogotá" />
      </div>

      <div className="info-section">
        <img src="src/images/magnifying.png" alt="Lupa" />
        <p>Encontrarás un buscador que te permite buscar estacionamientos por ubicación o características específicas. Simplemente ingresa palabras clave relacionadas y haciendo click en el ícono de búsqueda.</p>
      </div>

      <div className="info-section">
        <p>Si experimentas algún inconveniente o deseas reportar un problema, simplemente puedes hacer click en el botón "Reportar problema". Con ésto podrás enviar un comentario que será revisado por nuestro equipo.</p>
        <img src="src/images/support.jpg" alt="Soporte" />
      </div>

      <div className="button-container">
        <a href="/" className="start-button">Vuelve al inicio</a>
      </div>
    </div>
  );
};

export default Info;