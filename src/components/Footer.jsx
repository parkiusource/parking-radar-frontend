import '../styles/Footer.css';

const Footer = () => (
  <footer className="app-footer bg-dark text-white text-center py-3">
    <div className="container">
      <p className="mb-0">&copy; 2024 Smart Parking Radar. Todos los derechos reservados.</p>
      <div>
        <a href="#" className="text-white mx-2">Política de Privacidad</a>
        <a href="#" className="text-white mx-2">Términos de Servicio</a>
      </div>
    </div>
  </footer>
);

export default Footer;
