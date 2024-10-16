import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCar, LuClock, LuMapPin, LuUsers } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

import David from '@/assets/team/David.jpg';
import Camilo from '@/assets/team/Camilo.jpg';
import Pedro from '@/assets/team/Pedro.jpg';

import { Button, Card } from '@/components/common';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

export default function About() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: LuCar,
      title: 'Localización Inteligente',
      description: 'Encuentra el parqueadero más cercano',
    },
    {
      icon: LuClock,
      title: 'Actualización En Tiempo Real',
      description: 'Obtén actualizaciones en tiempo real',
    },
    {
      icon: LuMapPin,
      title: 'Ahorra Tiempo',
      description: 'Reduce el tiempo buscando parqueadero',
    },
    {
      icon: LuUsers,
      title: 'Impulsado por la Comunidad',
      description:
        'Datos de estacionamiento reportados por usuarios para mayor precisión',
    },
  ];

  const teamMembers = [
    {
      name: 'Camilo León',
      role: 'CEO y Co-Fundador',
      image: Camilo,
      imageClassName: 'object-bottom',
    },
    {
      name: 'David Bautista',
      role: 'CTO y Co-Fundador',
      image: David,
    },
    {
      imageClassName: 'object-top',
      name: 'Pedro Castiblanco',
      role: 'Head de Ingeniería',
      image: Pedro,
    },
  ];

  return (
    <>
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
            Disponibilidad en tiempo real de parqueaderos en tu ciudad
          </motion.p>
        </section>

        <section className="container mx-auto px-4 py-12 pt-0">
          <div className="max-w-4xl mx-auto bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-lg">
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">
              Nuestra Misión
            </h2>
            <blockquote className="text-2xl italic text-gray-700 border-l-4 border-sky-500 pl-4">
              "Transformar la experiencia de parqueo en la ciudad, haciéndola
              simple, eficiente y libre de estrés para cada conductor."
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
        {false && (
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
              Conoce a Nuestro Equipo
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className={twMerge(
                        'w-full h-full object-cover',
                        member.imageClassName,
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {member.name}
                  </h3>
                  <p className="text-gray-600">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto bg-sky-500 bg-opacity-10 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              ¿Listo para Transformar Tu Experiencia de Parqueo?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Únete a miles de usuarios satisfechos y despídete del estrés de
              estacionar.
            </p>
            <Link to="/parking">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Comienza Ahora
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
