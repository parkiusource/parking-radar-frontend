import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button, Card } from '@/components/common';
import { CardContent } from '@/components/common/Card';
import { CheckCircle, Send, AlertCircle, MailIcon, PhoneIcon } from 'lucide-react';

import iconsupport from '@/assets/Icon-support.png';

const API_URL = 'https://eo5k21qt8rpapp6.m.pipedream.net';

const SupportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      subject: '',
      description: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      setSubmitStatus('success');
      reset();

      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Centro de Soporte - ParkiÜ</title>
        <meta name="description" content="Envía tus peticiones, quejas, sugerencias o reclamos a nuestro equipo de soporte de ParkiÜ" />
        <meta name="keywords" content="soporte, ayuda, contacto, parkiü, estacionamiento, parqueadero" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" as="style" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </Helmet>

      <Header />

      <main className="bg-secondary-50 min-h-full flex items-center pt-24 pb-12">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Centro de Soporte
          </h1>

          {/* Form Card - Perfectly centered */}
          <div className="w-full max-w-xl mx-auto">
            <Card className="bg-white rounded-xl shadow-md overflow-hidden" size='xl'>
              <CardContent className="p-0">
                {/* Header section with image */}
                <div className="bg-primary-600 text-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">¿Cómo podemos ayudarte?</h2>
                      <p className="mt-1 text-sm text-primary-100">
                        Completa el formulario y nuestro equipo te responderá a la brevedad
                      </p>
                    </div>
                    <img
                      src={iconsupport}
                      alt="Soporte ParkiÜ"
                      className="w-16 h-16 object-contain"
                      width="64"
                      height="64"
                    />
                  </div>
                </div>

                {/* Status messages */}
                {submitStatus === 'success' && (
                  <motion.div
                    className="flex items-center p-4 mx-3 sm:mx-5 mt-4 text-sm rounded-lg bg-green-50 text-green-800 border border-green-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>¡Tu solicitud ha sido enviada correctamente! Te contactaremos pronto.</span>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    className="flex items-center p-4 mx-3 sm:mx-5 mt-4 text-sm rounded-lg bg-red-50 text-red-800 border border-red-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente.</span>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Nombre */}
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="username"
                        type="text"
                        className={`w-full px-3 py-2 rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="Escribe tu nombre"
                        {...register("username", {
                          required: "El nombre es obligatorio"
                        })}
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Correo electrónico <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`w-full px-3 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="tu@correo.com"
                        {...register("email", {
                          required: "El correo electrónico es obligatorio",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Ingresa un correo electrónico válido"
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Asunto */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Asunto <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className={`w-full px-3 py-2 rounded-lg border ${errors.subject ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Ej. Problema con mi reserva"
                      {...register("subject", {
                        required: "El asunto es obligatorio"
                      })}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      rows="5"
                      className={`w-full px-3 py-2 rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Describe detalladamente tu petición, queja, sugerencia o reclamo"
                      {...register("description", {
                        required: "La descripción es obligatoria",
                        minLength: {
                          value: 20,
                          message: "Por favor proporciona una descripción más detallada (mínimo 20 caracteres)"
                        }
                      })}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Todos los campos marcados con <span className="text-red-500">*</span> son obligatorios
                    </p>
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full py-2.5 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-r-transparent rounded-full" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Enviar solicitud</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Simple contact info - better alignment for mobile */}
            <div className="mt-6 sm:mt-8 mb-8 text-center">
              <p className="text-gray-600 mb-2">
                ¿Necesitas ayuda inmediata? Contáctanos:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-2">
                <a href="mailto:soporte@parkiu.com" className="flex items-center text-primary-600 hover:underline">
                  <MailIcon className="w-4 h-4 mr-1.5" />
                  soporte@parkiu.com
                </a>
                <a href="tel:+573001234567" className="flex items-center text-primary-600 hover:underline">
                  <PhoneIcon className="w-4 h-4 mr-1.5" />
                  +57 300 123 4567
                </a>
                <a
                  href="https://wa.me/573001234567?text=Hola%2C%20necesito%20ayuda%20con%20ParkiÜ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-green-600 hover:underline"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SupportForm;
