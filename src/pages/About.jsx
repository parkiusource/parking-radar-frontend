import { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LuCar, LuClock, LuMapPin, LuUsers, LuShield, LuTrendingUp, LuTarget, LuHeart } from 'react-icons/lu';
import { FaSquareParking } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Card } from '@/components/common';
import { CardContent } from '@/components/common/Card';
import DarkFooter from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

// Memoized components for better performance
const FeatureCard = memo(({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group relative w-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
    <Card className="relative h-full bg-white hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6 sm:p-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary-600 text-white flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
));

FeatureCard.displayName = 'FeatureCard';

const ValueCard = memo(({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
  >
    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
    <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 group-hover:text-primary-600 transition-colors">{title}</h4>
    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{description}</p>
  </motion.div>
));

ValueCard.displayName = 'ValueCard';

const TeamMemberCard = memo(({ member, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group relative w-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
    <div className="relative bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold group-hover:scale-110 transition-transform">
        {member.name.charAt(0)}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3 text-gray-800">{member.name}</h3>
      <p className="text-primary-600 text-center text-base sm:text-lg mb-3 sm:mb-4">{member.role}</p>
      <p className="text-gray-700 text-center text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">{member.bio}</p>
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
        {member.expertise.map((skill, skillIndex) => (
          <span
            key={skillIndex}
            className="bg-primary-50 text-primary-700 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
));

TeamMemberCard.displayName = 'TeamMemberCard';

export default function About() {
  const { t } = useTranslation();

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
      bio: 'Arquitecto de software e investigador en movilidad sostenible. Líder en implementación de arquitecturas escalables y promotor de tecnologías que impactan positivamente en las ciudades.',
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
        <title>{t('about.meta.title', 'Sobre Nosotros | ParkiÜ - Innovación en gestión de parqueaderos')}</title>
        <meta name="description" content={t('about.meta.description', 'Conoce cómo ParkiÜ está revolucionando la forma de encontrar estacionamiento con tecnología inteligente y una comunidad colaborativa.')} />
        <meta name="keywords" content={t('about.meta.keywords', 'sobre parkiü, nosotros, misión parkiü, equipo parkiü, aplicación parqueaderos, innovación estacionamiento')} />
        <meta property="og:title" content={t('about.meta.ogTitle', 'Sobre Nosotros | ParkiÜ')} />
        <meta property="og:description" content={t('about.meta.ogDescription', 'ParkiÜ está transformando la experiencia de buscar estacionamiento con tecnología inteligente y datos en tiempo real.')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://parkiu.app/about" />
      </Helmet>

      <Header />

      <main className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-16 sm:pt-20 md:pt-24">
        {/* Hero Section - Enhanced */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28">
          <motion.div
            className="flex flex-col items-center max-w-5xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-primary-600 p-4 sm:p-6 rounded-full mb-6 sm:mb-8 text-white"
            >
              <FaSquareParking className="text-4xl sm:text-5xl" />
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 text-gray-800 leading-tight"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('about.hero.title', 'Transformando la movilidad urbana en')}{' '}
              <span className="text-primary-600">Colombia</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl md:text-3xl text-gray-700 mb-8 sm:mb-12 leading-relaxed max-w-4xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t('about.hero.subtitle', 'Creamos soluciones innovadoras que hacen que encontrar estacionamiento sea una experiencia simple, segura y eficiente.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto"
            >
              <Link to="/admin-landing" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  {t('about.hero.cta.explore', 'Explorar Solución')}
                </Button>
              </Link>
              <Link to="/support" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-medium transition-all duration-300">
                  {t('about.hero.cta.contact', 'Contactar')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Mission Section - Enhanced */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 sm:p-10 md:p-16 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 sm:h-3 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />

              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800">
                    {t('about.mission.title', 'Nuestra Misión')}
                  </h2>
                  <blockquote className="text-xl sm:text-2xl italic text-gray-700 border-l-4 border-primary-600 pl-4 sm:pl-6 mb-6 sm:mb-8">
                    {t('about.mission.quote', '"Transformar la experiencia de estacionamiento para crear ciudades más eficientes y sostenibles."')}
                  </blockquote>
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8">
                    {t('about.mission.description', 'Nos dedicamos a simplificar la movilidad urbana, haciendo que encontrar y gestionar estacionamientos sea una experiencia sin complicaciones.')}
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4 text-gray-800">{t('about.vision.title', 'Visión')}</h3>
                    <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                      {t('about.vision.description', 'Ser líderes en la transformación digital del sector de estacionamientos en Latinoamérica, creando un ecosistema que beneficie a usuarios y operadores.')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {values.map((value, index) => (
                      <ValueCard
                        key={value.title}
                        icon={value.icon}
                        title={value.title}
                        description={value.description}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              {t('about.features.title', 'Lo Que Nos Hace Únicos')}
            </h2>
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed">
              {t('about.features.subtitle', 'Combinamos tecnología avanzada con experiencia local para ofrecer soluciones innovadoras.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Stats Section - Enhanced */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 sm:p-12 md:p-16 shadow-xl text-white max-w-6xl mx-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-center">
                {t('about.stats.title', 'Nuestro Impacto')}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
                {[
                  { value: '5K+', label: t('about.stats.activeUsers', 'Usuarios Activos') },
                  { value: '120+', label: t('about.stats.parkingLots', 'Parqueaderos') },
                  { value: '5', label: t('about.stats.cities', 'Ciudades') },
                  { value: '30%', label: t('about.stats.timeSaving', 'Ahorro de Tiempo') }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4">{stat.value}</p>
                    <p className="text-base sm:text-lg md:text-xl text-white/90">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section - Enhanced */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              {t('about.team.title', 'Nuestro Equipo')}
            </h2>
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed">
              {t('about.team.subtitle', 'Profesionales apasionados por crear soluciones innovadoras para la movilidad urbana.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={index}
                member={member}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 pb-20 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-white rounded-2xl p-8 sm:p-12 md:p-16 shadow-xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-50" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
                {t('about.cta.title', 'Sé parte del futuro del estacionamiento')}
              </h2>
              <p className="text-xl sm:text-2xl text-gray-700 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                {t('about.cta.description', 'Únete a nuestra comunidad y ayúdanos a transformar la movilidad urbana en Colombia.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link to="/admin-landing" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    {t('about.cta.startNow', 'Comenzar Ahora')}
                  </Button>
                </Link>
                <Link to="/support" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold transition-all duration-300">
                    {t('about.cta.contactTeam', 'Contactar Equipo')}
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
