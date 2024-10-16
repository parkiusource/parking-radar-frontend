import { useState } from 'react';
import iconPQRS from '../assets/Icon-PQRS.png';

const API_URL = 'https://eo5k21qt8rpapp6.m.pipedream.net';

const PQRSForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Exito:', data);
        alert('Tu PQRS ha sido enviado correctamente.');
        setFormData({
          username: '',
          email: '',
          description: '',
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        alert(
          'Estamos presentando dificultades, \n Intentalo nuevamente mas tarde.',
        );
      });
  };

  return (
    <div className="container mt-5">
      <section className="card mb-4 shadow-sm">
        <div className="card-body" style={{ textAlign: 'left' }}>
          <div
            className="feature-item"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h2>
              Envía tu Peticion, Queja, Sugerencia o Reclamo y estaremos atentos
              para resolverla
            </h2>
            <img
              src={iconPQRS}
              alt="Icono de presentación"
              className="feature-icon"
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Nombre de Usuario
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Descripción de tu PQRS
              </label>
              <textarea
                type="text"
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Crear PQRS
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PQRSForm;
