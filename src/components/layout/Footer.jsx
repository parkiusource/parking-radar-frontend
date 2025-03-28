import { FaInstagram, FaSquareFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa6';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';

const FooterSection = ({ title, children }) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

const FooterLink = ({ to, external, children }) => {
  const className = "hover:text-primary transition-colors text-gray-300";

  return external ? (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

const DarkFooter = ({ className }) => {
  const { t } = useTranslation();

  return (
    <footer
      className={twMerge(
        'bg-secondary-900 text-gray-200',
        className,
      )}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">ParkiÜ</h2>
            <p className="text-gray-300 mb-4">
            {t('footer.description', 'La plataforma líder para encontrar y gestionar parqueaderos en tiempo real.')}
            </p>
            <div className="flex items-center gap-4 text-xl">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Facebook"
                className="hover:text-primary transition-colors"
              >
                <FaSquareFacebook />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
                className="hover:text-primary transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Twitter"
                className="hover:text-primary transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en LinkedIn"
                className="hover:text-primary transition-colors"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          <FooterSection title={t('footer.quickLinks.title', 'Enlaces rápidos')}>
            <FooterLink to="/">{t('footer.quickLinks.home', 'Inicio')}</FooterLink>
            <FooterLink to="/parking">{t('footer.quickLinks.searchParking', 'Buscar parqueaderos')}</FooterLink>
            <FooterLink to="/admin-landing">{t('footer.quickLinks.manageParking', 'Administrar parqueadero')}</FooterLink>
            <FooterLink to="/about">{t('footer.quickLinks.aboutUs', 'Acerca de nosotros')}</FooterLink>
          </FooterSection>

          <FooterSection title={t('footer.legal.title', 'Legal')}>
            <FooterLink to="/terms">{t('footer.legal.termsAndConditions', 'Términos y condiciones')}</FooterLink>
            <FooterLink to="/privacy">{t('footer.legal.privacyPolicy', 'Política de privacidad')}</FooterLink>
            <FooterLink to="/cookies">{t('footer.legal.cookiePolicy', 'Política de cookies')}</FooterLink>
            <FooterLink to="/support">{t('footer.legal.support', 'Soporte')}</FooterLink>
          </FooterSection>

          <FooterSection title={t('footer.contact.title', 'Contacto')}>
            <div className="flex items-center gap-2 text-gray-300">
              <FaEnvelope className="text-primary-300" />
              <a href="mailto:contacto@parkiu.com" className="hover:text-primary transition-colors">
                contacto@parkiu.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <FaPhone className="text-primary-300" />
              <a href="tel:+573001234567" className="hover:text-primary transition-colors">
                +57 300 123 4567
              </a>
            </div>
          </FooterSection>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {t('footer.allRightsReserved', 'ParkiÜ. Todos los derechos reservados.')}</p>
        </div>
      </div>
    </footer>
  );
};
export default DarkFooter;
