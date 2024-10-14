// src/pages/RegistroAdmin.js

import { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import iconAdmin from '../assets/Icon-Admin.png';

const API_URL = 'https://eo5k21qt8rpapp6.m.pipedream.net';

const RegistroAdmin = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
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

    .then(response => response.json())
    .then(data => {
      console.log('Exito:', data);
      alert('Registro realizado correctamente.');
        setFormData({
        username: '',
        email: '',
        password: '',
        });
    })
    .catch((error) => {
      console.error('Error:', error);
        alert('Estamos presentando dificultades, \n Intentalo nuevamente mas tarde.');
    });
  };

  return (
    <div className="container mt-5">
      <section className="card mb-4 shadow-sm">
        <div className="card-body" style={{ textAlign: 'left' }}>

          <div className="feature-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h2>Registro de Administrador</h2>
            <img src={iconAdmin} alt="Icono de presentación" className="feature-icon" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Nombre de Usuario</label>
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
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
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
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Registrar</button>
          </form>
          <p className="mt-3">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </section> 
    </div>
  );
};

export default RegistroAdmin;
