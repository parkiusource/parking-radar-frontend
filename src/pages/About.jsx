/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCar, LuClock, LuMapPin, LuUsers } from 'react-icons/lu';

import { Button, Card } from '@/components/common';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

export default function About() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: LuCar,
      title: 'Localización Inteligente',
      description: 'Descubre el parqueadero ideal cerca de ti en segundos.',
    },
    {
      icon: LuClock,
      title: 'Actualización en Tiempo Real',
      description: 'Conoce al instante si hay espacios libres en tu destino.',
    },
    {
      icon: LuMapPin,
      title: 'Gana Tiempo para Ti',
      description:
        'Encuentra estacionamiento rápidamente y dedica más tiempo a lo que importa.',
    },
    {
      icon: LuUsers,
      title: 'Comunidad a Tu Servicio',
      description:
        'Disfruta de información fiable, actualizada por usuarios como tú.',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 mt-12">
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-gray-800 flex gap-2 items-center justify-center"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span>Sobre</span>
            <span className="text-primary-50 text-shadow-primary translate-y-[2px] scale-[95%]">
              Parkify
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Encuentra parqueaderos disponibles en tiempo real, donde y cuando lo
            necesites.
          </motion.p>
        </section>

        <section className="container mx-auto px-4 py-12 pt-0">
          <div className="max-w-4xl mx-auto bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-lg">
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">
              Nuestra Misión
            </h2>
            <blockquote className="text-2xl italic text-gray-700 border-l-4 border-sky-500 pl-4">
              "Revolucionar la experiencia de estacionamiento, haciéndola más
              sencilla, eficiente y libre de estrés para cada conductor."
            </blockquote>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
            Qué Nos Hace Únicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative"
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className="h-full bg-white rounded-lg bg-opacity-70 backdrop-filter backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="py-4 flex flex-col items-center text-center">
                    <feature.icon className="w-12 h-12 text-sky-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Card>
                {hoveredFeature === index && (
                  <motion.div
                    className="absolute inset-0 bg-sky-500 opacity-10 rounded-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto bg-sky-500 bg-opacity-10 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              ¿Listo para Olvidarte del Estrés al Estacionar?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Únete a miles de usuarios que ya disfrutan de estacionar fácil y
              rápido.
            </p>
            <Link to="/parking">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                ¡Encuentra Tu Parqueadero!
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
