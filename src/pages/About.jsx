import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LuCar, LuClock, LuMapPin, LuUsers, LuShield, LuTrendingUp, LuTarget, LuHeart } from 'react-icons/lu';
import { FaSquareParking } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Card } from '@/components/common';
import { CardContent } from '@/components/common/Card';
import DarkFooter from '@/components/Footer';
import { Header } from '@/components/Header';

export default function About() {
  const { t } = useTranslation();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: LuCar,
      title: t('about.features.locationAlgorithm.title', 'Localización Inteligente'),
      description: t('about.features.locationAlgorithm.description', 'Algoritmos que encuentran parqueaderos según tu ubicación y preferencias.'),
    },
    {
      icon: LuClock,
      title: t('about.features.realTime.title', 'Tiempo Real'),
      description: t('about.features.realTime.description', 'Datos actualizados de disponibilidad, tarifas y horarios.'),
    },
    {
      icon: LuMapPin,
      title: t('about.features.timeSaving.title', 'Ahorro de Tiempo'),
      description: t('about.features.timeSaving.description', 'Reduce hasta un 70% el tiempo de búsqueda.'),
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

  const values = [
    {
      icon: LuTarget,
      title: 'Innovación',
      description: 'Buscamos constantemente nuevas formas de mejorar la experiencia de estacionamiento.',
    },
    {
      icon: LuUsers,
      title: 'Comunidad',
      description: 'Construimos una red colaborativa que beneficia a todos los usuarios.',
    },
    {
      icon: LuShield,
      title: 'Confianza',
      description: 'Priorizamos la seguridad y transparencia en cada interacción.',
    },
    {
      icon: LuHeart,
      title: 'Impacto',
      description: 'Contribuimos a crear ciudades más eficientes y sostenibles.',
    },
  ];

  const teamMembers = [
    {
      name: 'Camilo León',
      role: 'CEO & Co-Fundador',
      bio: 'Arquitecto de software e investigador en movilidad sostenible.   Líder en implementación de arquitecturas escalables y promotor de tecnologías que impactan positivamente en las ciudades.',
      expertise: [
        'Arquitectura de Software',
        'Movilidad Sostenible',
        'Innovación Urbana',
        'Cloud Computing',
        'Investigación & Desarrollo'
      ]
    },
    {
      name: 'David Bautista',
      role: 'CTO',
      bio: 'Desarrollador especializado en aplicaciones geoespaciales y sistemas escalables.',
      expertise: ['Desarrollo Full-Stack', 'AWS', 'Sistemas Distribuidos']
    },
    {
      name: 'Pedro Castiblanco',
      role: 'Director de Operaciones',
      bio: 'Experto en logística urbana y optimización de procesos empresariales.',
      expertise: ['Operaciones', 'Logística', 'Gestión de Proyectos']
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
        {/* Hero Section - Mejorado */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <motion.div
            className="flex flex-col items-center max-w-4xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-primary/10 p-4 rounded-full mb-6"
            >
              <FaSquareParking className="text-primary text-4xl" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-800 text-balance"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transformando la movilidad urbana en{' '}
              <span className="text-primary">Colombia</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Creamos soluciones innovadoras que hacen que encontrar estacionamiento sea una experiencia simple, segura y eficiente.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-4"
            >
              <Link to="/parking">
                <Button className="bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  Explorar Solución
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary-50 px-8 py-3 rounded-xl font-medium transition-all duration-300">
                  Contactar
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Mission Section - Rediseñado */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary-400 to-primary-600" />

              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    Nuestra Misión
                  </h2>
                  <blockquote className="text-xl italic text-gray-700 border-l-4 border-primary pl-4 mb-6">
                    &ldquo;Transformar la experiencia de estacionamiento para crear ciudades más eficientes y sostenibles.&rdquo;
                  </blockquote>
                  <p className="text-gray-600 mb-6">
                    Nos dedicamos a simplificar la movilidad urbana, haciendo que encontrar y gestionar estacionamientos sea una experiencia sin complicaciones.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">Visión</h3>
                    <p className="text-gray-600">
                      Ser líderes en la transformación digital del sector de estacionamientos en Latinoamérica, creando un ecosistema que beneficie a usuarios y operadores.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {values.map((value, index) => (
                      <motion.div
                        key={value.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <value.icon className="w-6 h-6 text-primary mb-2" />
                        <h4 className="font-semibold text-gray-800 mb-1">{value.title}</h4>
                        <p className="text-sm text-gray-600">{value.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section - Mejorado */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Lo Que Nos Hace Únicos
            </h2>
            <p className="text-xl text-gray-600">
              Combinamos tecnología avanzada con experiencia local para ofrecer soluciones innovadoras.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
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

        {/* Stats Section - Rediseñado */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-8 md:p-12 shadow-xl text-white max-w-5xl mx-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Nuestro Impacto</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold mb-2">5K+</p>
                  <p className="text-sm md:text-base opacity-90">Usuarios Activos</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold mb-2">120+</p>
                  <p className="text-sm md:text-base opacity-90">Parqueaderos</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold mb-2">5</p>
                  <p className="text-sm md:text-base opacity-90">Ciudades</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold mb-2">30%</p>
                  <p className="text-sm md:text-base opacity-90">Ahorro de Tiempo</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section - Rediseñado */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600">
              Profesionales apasionados por crear soluciones innovadoras para la movilidad urbana.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-center mb-2">{member.name}</h3>
                <p className="text-primary-600 text-center text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-center mb-4">{member.bio}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {member.expertise.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section - Mejorado */}
        <section className="container mx-auto px-4 py-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-50" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Sé parte del futuro del estacionamiento
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Únete a nuestra comunidad y ayúdanos a transformar la movilidad urbana en Colombia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/admin-landing">
                  <Button className="bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                    Contactar Equipo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <DarkFooter />
    </>
  );
}
