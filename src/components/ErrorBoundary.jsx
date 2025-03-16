import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Aquí podrías enviar el error a un servicio de logging
    if (import.meta.env.MODE !== 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" role="alert">
          <div className="error-boundary-content">
            <h2>¡Ups! Algo salió mal</h2>
            <p>Lo sentimos, ha ocurrido un error inesperado.</p>
            <button
              onClick={this.handleReload}
              className="error-boundary-button"
              aria-label="Recargar la página"
            >
              Recargar página
            </button>
            {import.meta.env.MODE !== 'production' && (
              <details className="error-details">
                <summary>Detalles del error</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
