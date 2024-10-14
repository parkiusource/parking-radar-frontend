import '../styles/HomePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import iconAboutUs from '../assets/Icon-AboutUs.png';
import iconGoal from '../assets/Icon-Goal.png';
import iconCelebrate from '../assets/Icon-Celebrate.png';
import iconGuide from '../assets/Icon-Guide.png';
import iconSmartCar from '../assets/Icon-SmartCar.png';
import iconInteresting from '../assets/Icon-Interesting.png';
import iconLogo from '../assets/smart-parking-logo3.png';

  const Features = () => {
    return (
      <div className="home-page">
        <main className="home-content container mt-5">
          <section className="card mb-4 shadow-sm">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <h1 className="card-title"><strong>SOBRE NOSOTROS</strong></h1>
              <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'justify' }}>
                  <img src={iconAboutUs} alt="Icono de presentación" className="feature-icon" />
                  <span>Este proyecto nació como proyecto de grado para la Especialización en Ingeniería de Software en la Universidad Antonio Nariño, realizado por los estudiantes durante los dos semestres académicos del año 2024.</span>
              </div>
              <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'justify' }}>
                  <span>El propósito de este proyecto es desarrollar un prototipo de un sistema que identifique los parqueaderos ubicados en lugares de interés en las zonas urbanas de Bogotá, con el objetivo es mejorar la experiencia de los usuarios al buscar estacionamientos en áreas con alta actividad, como lo pueden ser zonas comerciales y de entretenimiento.</span>
                  <img src={iconGoal} alt="Icono de mapa" className="feature-icon" />
              </div>
              <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'justify' }}>
                  <img src={iconGuide} alt="Icono de características" className="feature-icon" />
                  <span>Para hacerlo realidad, el sistema proporciona acceso a información en tiempo real sobre la disponibilidad de los espacios de estacionamiento. Esto permite guiar a los conductores hacia lugares de fácil acceso, de manera ágil y cercanos a sus destinos, esperando contribuir a la descongestión vial y apoyar la economía local.</span>
              </div>
              <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'justify' }}>
                  <span>En términos técnicos, hemos diseñado un dispositivo IoT que se instala físicamente en cada parqueadero, éste dispositivo envía información en tiempo real a un servicio de desarrollado propio, el cual administra la información de manera ágil. Finalmente para que nuestros usuarios puedan consultar el estado de los estacionamientos se hizo la presente página web.</span>
                  <img src={iconSmartCar} alt="Icono de contacto" className="feature-icon" />
              </div>
              
              <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'justify' }}>
                  <img src={iconCelebrate} alt="Icono de contacto" className="feature-icon" />
                  <span>Agradecemos profundamente el apoyo recibido durante el desarrollo de este proyecto y esperamos que nuestra solución sea de gran utilidad para todos. Nos entusiasma la posibilidad de mejorar la experiencia de estacionamiento en Bogotá y confiamos en que esta herramienta les facilitará la búsqueda de espacios disponibles.</span>
              </div>

              <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'justify'}}>
                  <img src={iconLogo} alt="Icono de contacto" className="feature-icon" />
                  <span><strong>¡Gracias por su interés en nuestro trabajo!</strong></span>
                  <img src={iconInteresting} alt="Icono de contacto" className="feature-icon" />
              </div>

            </div>
          </section>
        </main>
      </div>
    );
  };

  export default Features;