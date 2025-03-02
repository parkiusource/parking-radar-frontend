import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Contenedor principal del footer con espaciado responsivo */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col">
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              ParkiÜ te ayuda a encontrar el mejor parqueadero según tus necesidades, con información en tiempo real sobre disponibilidad, tarifas y seguridad.
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos - Agrupados en móvil, separados en desktop */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Columna 1 */}
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-3 md:mb-4">Enlaces Rápidos</h3>
                <ul className="space-y-2 md:space-y-3">
                  <li>
                    <Link to="/about" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Precios
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Columna 2 */}
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-3 md:mb-4">Servicios</h3>
                <ul className="space-y-2 md:space-y-3">
                  <li>
                    <Link to="/parking" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Buscar Parqueaderos
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin-landing" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Registrar Parqueadero
                    </Link>
                  </li>
                  <li>
                    <Link to="/compare" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Comparar Opciones
                    </Link>
                  </li>
                  <li>
                    <Link to="/reviews" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Ver Reseñas
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Columna 3 */}
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-3 md:mb-4">Soporte</h3>
                <ul className="space-y-2 md:space-y-3">
                  <li>
                    <Link to="/faq" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Preguntas Frecuentes
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Centro de Ayuda
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-gray-500 hover:text-primary transition-colors text-sm">
                      Términos de Uso
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-100 mt-8 pt-6 md:mt-10 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs md:text-sm text-center sm:text-left">
            &copy; {currentYear} ParkiÜ. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacidad
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Términos
            </Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
