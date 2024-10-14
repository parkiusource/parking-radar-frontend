import '../styles/HomePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import iconMap from '../assets/Icon-Map.png';
import iconLogin from '../assets/Icon-Login.png';
import iconInfo from '../assets/Icon-Info.png';
import iconHome from '../assets/Icon-Home.png';
import iconContact from '../assets/Icon-Contact.png';


const HomePage = () => {
  return (
    <div className="home-page">
      <main className="home-content container mt-5">
        <section className="card mb-4 shadow-sm">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <h1 className="card-title"><strong>Características Destacadas</strong></h1>
            <h3>Descubre cómo nuestra aplicación puede facilitar tu experiencia de estacionamiento:</h3>
            <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Link className="nav-link" to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img src={iconHome} alt="Icono de presentación" className="feature-icon" />
                <span>Ten una idea de la navegación en nuestro sitio, de hecho, acá estás ahora mismo.</span>
              </Link>
            </div>
            <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Link className="nav-link" to="/map" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <span>Encuentra espacios disponibles al instante en el mapa interactivo que tenemos disponible 24/7 para tí.</span>
                <img src={iconMap} alt="Icono de mapa" className="feature-icon" />
              </Link>
            </div>
            <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Link className="nav-link" to="/features" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img src={iconInfo} alt="Icono de características" className="feature-icon" />
                <span>Descubre más información sobre nosotros y sobre nuestro servicio.</span>
              </Link>
            </div>
            <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Link className="nav-link" to="/pqrs" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <span>Ingresa para solicitar información adicional, hacer peticiones, imponer un queja, darnos sugerencias o realizar un reclamo, contáctanos y tendremos el gusto de atenderte.</span>
                <img src={iconContact} alt="Icono de contacto" className="feature-icon" />
              </Link>
            </div>
            <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Link className="nav-link" to="/register-admin" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img src={iconLogin} alt="Icono de registro" className="feature-icon" />
                <span>¿Ya eres administrador?, accede a todas nuestras funcionalidades desde ésta sección.</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
