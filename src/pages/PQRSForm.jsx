import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button, Card } from '@/components/common';
import { CardContent } from '@/components/common/Card';

import iconPQRS from '../assets/Icon-PQRS.png';
import { useState } from 'react';

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

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(() => {
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
          'Hubo un error al enviar tu PQRS. Por favor, intenta nuevamente más tarde.',
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 ">
        <section className="container mx-auto bg-white px-4 py-20 flex flex-col items-center justify-center">
          <Card className="h-full bg-opacity-70 backdrop-filter backdrop-blur-sm hover:shadow-xl transition-shadow duration-300 mt-12">
            <CardContent className="py-4 flex flex-col items-center text-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
              </h3>
              <p className="text-gray-600"></p>
              <div className="text-left">
                <div className="flex justify-center items-center mb-6">
                  <h2 className="text-2xl font-bold mr-4">
                    Envía tu Petición, Queja, Sugerencia o Reclamo
                  </h2>
                  <img src={iconPQRS} alt="Icono PQRS" className="w-16 h-16" />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Descripción de tu PQRS
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    className="w-full "
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar PQRS'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PQRSForm;
