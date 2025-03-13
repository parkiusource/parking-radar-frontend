import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LuCar, LuClock, LuMapPin, LuUsers, LuShield, LuTrendingUp } from 'react-icons/lu';
import { FaSquareParking } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

import { Button, Card } from '@/components/common';
import { CardContent } from '@/components/common/Card';
import DarkFooter from '@/components/Footer';
import { Header } from '@/components/Header';

export default function About() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: LuCar,
      title: 'Localización Inteligente',
      description: 'Algoritmos que encuentran parqueaderos según tu ubicación y preferencias.',
    },
    {
      icon: LuClock,
      title: 'Tiempo Real',
      description: 'Datos actualizados de disponibilidad, tarifas y horarios.',
    },
    {
      icon: LuMapPin,
      title: 'Ahorro de Tiempo',
      description: 'Reduce hasta un 70% el tiempo de búsqueda.',
    },
    {
      icon: LuUsers,
      title: 'Comunidad',
      description: 'Red de usuarios que mantienen información actualizada.',
    },
    {
      icon: LuShield,
      title: 'Seguridad',
      description: 'Índices de seguridad basados en experiencias verificadas.',
    },
    {
      icon: LuTrendingUp,
      title: 'Análisis Predictivo',
      description: 'Anticipamos disponibilidad futura basada en patrones históricos.',
    },
  ];

  const teamMembers = [
    {
      name: 'Ana Martínez',
      role: 'CEO & Fundadora',
      bio: 'Especialista en soluciones de movilidad urbana.',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'CTO',
      bio: 'Desarrollador especializado en aplicaciones geoespaciales.',
    },
    {
      name: 'Sofía Valencia',
      role: 'Directora de Operaciones',
      bio: 'Experta en logística urbana y optimización.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Sobre Nosotros | ParkiÜ - Innovación en gestión de parqueaderos</title>
        <meta name="description" content="Conoce cómo ParkiÜ está revolucionando la forma de encontrar estacionamiento con tecnología inteligente y una comunidad colaborativa." />
        <meta name="keywords" content="sobre parkiü, nosotros, misión parkiü, equipo parkiü, aplicación parqueaderos, innovación estacionamiento" />
        <meta property="og:title" content="Sobre Nosotros | ParkiÜ" />
        <meta property="og:description" content="ParkiÜ está transformando la experiencia de buscar estacionamiento con tecnología inteligente y datos en tiempo real." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://parkiu.app/about" />
      </Helmet>

      <Header />
      <main className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 md:py-10 text-center">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FaSquareParking className="text-primary text-3xl mb-3" />
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-gray-800 text-balance max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Transformando el estacionamiento
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-gray-600 mb-4 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Tecnología y colaboración para encontrar parqueaderos de forma rápida, segura y conveniente.
            </motion.p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-7 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 text-center">
              Nuestra Misión
            </h2>
            <blockquote className="text-base md:text-lg italic text-gray-700 border-l-4 border-primary pl-4 mb-6">
              &quot;Simplificar la experiencia de estacionamiento y contribuir a la movilidad sostenible.&quot;
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Visión</h3>
                <p className="text-gray-600 text-sm md:text-base">Ser la plataforma líder en gestión inteligente de parqueaderos, creando ciudades más eficientes.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Valores</h3>
                <ul className="text-gray-600 space-y-1 text-sm md:text-base">
                  <li>• Innovación constante</li>
                  <li>• Transparencia</li>
                  <li>• Comunidad</li>
                  <li>• Impacto positivo</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-800">
              Lo Que Nos Hace Únicos
            </h2>
            <p className="text-sm md:text-base text-gray-600 text-center mb-6 max-w-xl mx-auto">
              Soluciones innovadoras para una mejor experiencia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className="h-full bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-2">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold mb-1 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
                {hoveredFeature === index && (
                  <motion.div
                    className="absolute inset-0 bg-primary opacity-5 rounded-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-primary to-primary-700 rounded-xl p-5 md:p-6 shadow-lg text-white max-w-5xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Nuestro Impacto</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl md:text-3xl font-bold mb-1">5K+</p>
                <p className="text-xs md:text-sm opacity-90">Usuarios</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold mb-1">120+</p>
                <p className="text-xs md:text-sm opacity-90">Parqueaderos</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold mb-1">5</p>
                <p className="text-xs md:text-sm opacity-90">Ciudades</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold mb-1">30%</p>
                <p className="text-xs md:text-sm opacity-90">Ahorra tiempo</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-4 py-8 bg-gradient-to-br from-white to-primary-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-800">
              Nuestro Equipo
            </h2>
            <p className="text-sm md:text-base text-gray-600 text-center mb-6 max-w-xl mx-auto">
              Profesionales apasionados por resolver problemas urbanos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-primary text-lg font-bold">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-base font-semibold text-center mb-1">{member.name}</h3>
                <p className="text-primary-600 text-center text-xs md:text-sm">{member.role}</p>
                <p className="text-gray-600 text-center text-xs md:text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-8 pb-12 text-center">
          <div className="max-w-xl mx-auto bg-white rounded-xl p-5 md:p-6 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">
              ¿Listo para olvidar el estrés?
            </h2>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              Únete a miles de usuarios con una experiencia de estacionamiento sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/parking">
                <Button className="bg-primary hover:bg-primary-600 text-white font-medium py-2 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-300">
                  Encontrar Parqueadero
                </Button>
              </Link>
              <Link to="/admin-landing">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary-50 font-medium py-2 px-5 rounded-lg text-sm transition-all duration-300">
                  Registrar mi Parqueadero
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <DarkFooter />
    </>
  );
}
