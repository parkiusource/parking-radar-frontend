import '../styles/HomePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <main className="home-content container mt-5">
        <section className="card mb-4 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Características Destacadas</h2>
            <p>Descubre cómo nuestra aplicación puede facilitar tu experiencia de estacionamiento:</p>
            <ul className="list-unstyled">
              <li>🔍 <strong>Localización en Tiempo Real</strong>: Encuentra espacios disponibles al instante.</li>
              <li>📊 <strong>Análisis de Datos</strong>: Visualiza patrones de estacionamiento y optimiza tu tiempo.</li>
              <li>📱 <strong>Interacción Sencilla</strong>: Usa nuestra app para reservas y gestión de espacios.</li>
            </ul>
          </div>
        </section>

        <section className="card mb-4 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Contacto</h2>
            <p>Para más información o asistencia, contáctanos a través de nuestro formulario.</p>
          </div>
        </section>

        <section className="card mb-4 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Registro de Administrador</h2>
            <p>¿Eres un administrador y deseas gestionar la aplicación? Regístrate aquí:</p>
            <a href="/register-admin" className="btn btn-primary btn-lg">Registrarse como Admin</a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
