import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Button } from '@/components/common';

const CtaButtons = ({ auth: { isAuthenticated, isLoading }, onLogin }) => {
  return (
    <div className="flex gap-4">
      <Link to="/parking">
        <Button variant="outline">Encuentra tu parqueadero</Button>
      </Link>
      {isLoading || !isAuthenticated ? (
        <Button
          onClick={onLogin}
          className="flex-col px-6 py-2 leading-none"
          disabled={isLoading}
        >
          <span className="uppercase text-xs">Inicia sesión</span>
          <span className="text-[0.6rem] text-secondary-200">
            Y administra tus espacios
          </span>
        </Button>
      ) : (
        <Link to="/admin">
          <Button>Administra tus espacios</Button>
        </Link>
      )}
    </div>
  );
};

CtaButtons.displayName = 'CtaButtons';

CtaButtons.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
};

export { CtaButtons };