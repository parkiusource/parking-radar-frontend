import { useState } from 'react';
import iconPQRS from '../assets/Icon-PQRS.png';

const API_URL = 'https://eo5k21qt8rpapp6.m.pipedream.net';

const PQRSForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Enviando datos del formulario:', formData);

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Éxito:', data);
        alert('Tu PQRS ha sido enviado correctamente.');
        setFormData({
          username: '',
          email: '',
          description: '',
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Hubo un error al enviar tu PQRS. Por favor, intenta nuevamente más tarde.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="container mx-auto mt-32 px-4">
      <section className="bg-white p-6 shadow-lg rounded-lg">
        <div className="text-left">
          <div className="flex justify-center items-center mb-6">
            <h2 className="text-2xl font-bold mr-4">
              Envía tu Petición, Queja, Sugerencia o Reclamo
            </h2>
            <img src={iconPQRS} alt="Icono PQRS" className="w-16 h-16" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Descripción de tu PQRS
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className={`w-full px-4 py-2 text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar PQRS'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PQRSForm;
