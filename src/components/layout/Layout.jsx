import { Header } from '@/components/Header';
import DarkFooter from '@/components/Footer';
import PropTypes from 'prop-types';

/**
 * Layout principal de la aplicación que incluye Header y Footer
 */
export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <DarkFooter />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
