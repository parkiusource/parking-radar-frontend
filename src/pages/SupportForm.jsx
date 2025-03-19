import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
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

      // Auto-clear success message after 5 seconds
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
      </Helmet>

      <Header />

      <main className="bg-gradient-to-b from-primary-50 to-white min-h-[calc(100vh-64px)] py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Centro de Soporte
          </h1>

          <Card className="bg-white rounded-xl shadow-md overflow-hidden">
            <CardContent className="p-0">
              {/* Header section with image */}
              <div className="bg-primary-600 text-white p-6">
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
                  />
                </div>
              </div>

              {/* Status messages */}
              {submitStatus === 'success' && (
                <motion.div
                  className="flex items-center p-4 mx-6 mt-6 text-sm rounded-lg bg-green-50 text-green-800 border border-green-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>¡Tu solicitud ha sido enviada correctamente! Te contactaremos pronto.</span>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  className="flex items-center p-4 mx-6 mt-6 text-sm rounded-lg bg-red-50 text-red-800 border border-red-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>Hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente.</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
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
                      className={`w-full px-4 py-2 rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                      className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                    className={`w-full px-4 py-2 rounded-lg border ${errors.subject ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                    className={`w-full px-4 py-2 rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Describe detalladamente tu petición, queja, sugerencia o reclamo..."
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
                <div>
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
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

          {/* Simple contact info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">
              ¿Necesitas ayuda inmediata? Contáctanos:
            </p>
            <div className="flex items-center justify-center gap-6 mt-3">
              <a href="mailto:soporte@parkiu.com" className="flex items-center text-primary-600 hover:underline">
                <MailIcon className="w-4 h-4 mr-1" />
                soporte@parkiu.com
              </a>
              <a href="tel:+573001234567" className="flex items-center text-primary-600 hover:underline">
                <PhoneIcon className="w-4 h-4 mr-1" />
                +57 300 123 4567
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SupportForm;
