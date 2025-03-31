import { FaChartLine, FaUsers, FaMoneyBillWave, FaShieldAlt, FaClock, FaChartBar, FaMobileAlt, FaRegChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common';
import Footer from '@/components/layout/Footer';
import imgParkiu from '@/images/img-parking.webp';
import imgAdmin from '@/images/img-admin.webp';

const AdminLandingPage = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '30%', label: t('adminLanding.hero.stats.increaseOccupancy', 'Aumento promedio en ocupación') },
    { value: '45%', label: t('adminLanding.hero.stats.managementTime', 'Reducción en tiempo de gestión') },
    { value: '95%', label: t('adminLanding.hero.stats.userSatisfaction', 'Satisfacción de usuarios') },
    { value: '24/7', label: t('adminLanding.hero.stats.technicalSupport', 'Soporte técnico') }
  ];

  const features = [
    {
      icon: <FaChartLine className="w-6 h-6" />,
      title: t('adminLanding.features.items.realtimeAnalytics.title', 'Analítica en tiempo real'),
      description: t('adminLanding.features.items.realtimeAnalytics.description', 'Monitorea la ocupación y el rendimiento de tu parqueadero con datos actualizados al instante.')
    },
    {
      icon: <FaUsers className="w-6 h-6" />,
      title: t('adminLanding.features.items.customerManagement.title', 'Gestión de clientes'),
      description: t('adminLanding.features.items.customerManagement.description', 'Administra reservas, perfiles de usuarios y programas de fidelización desde un solo lugar.')
    },
    {
      icon: <FaMoneyBillWave className="w-6 h-6" />,
      title: t('adminLanding.features.items.financialControl.title', 'Control financiero'),
      description: t('adminLanding.features.items.financialControl.description', 'Seguimiento detallado de ingresos, facturación automática y reportes financieros.')
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: t('adminLanding.features.items.advancedSecurity.title', 'Seguridad avanzada'),
      description: t('adminLanding.features.items.advancedSecurity.description', 'Sistema de control de acceso y monitoreo de seguridad integrado.')
    }
  ];

  const benefits = [
    {
      icon: <FaClock className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.timeSavings.title', 'Ahorro de tiempo'),
      description: t('adminLanding.benefits.items.timeSavings.description', 'Automatiza tareas rutinarias y reduce el tiempo de gestión administrativa.'),
    },
    {
      icon: <FaChartBar className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.increasedVisibility.title', 'Mayor visibilidad'),
      description: t('adminLanding.benefits.items.increasedVisibility.description', 'Aumenta tu presencia digital y atrae más clientes potenciales.'),
    },
    {
      icon: <FaMobileAlt className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.mobileManagement.title', 'Gestión móvil'),
      description: t('adminLanding.benefits.items.mobileManagement.description', 'Administra tu negocio desde cualquier lugar con nuestra app móvil.'),
    },
    {
      icon: <FaRegChartBar className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.detailedReports.title', 'Reportes detallados'),
      description: t('adminLanding.benefits.items.detailedReports.description', 'Obtén insights valiosos con nuestros reportes personalizados.'),
    }
  ];

  const accessControlSystem = [
    {
      icon: <FaMoneyBillWave className="w-8 h-8" />,
      title: t('adminLanding.accessControlSystem.items.economicSolution.title', 'Solución económica'),
      description: t('adminLanding.accessControlSystem.items.economicSolution.description', 'Optimiza costos sin comprometer calidad.')
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: t('adminLanding.accessControlSystem.items.simplifiedControl.title', 'Control simplificado'),
      description: t('adminLanding.accessControlSystem.items.simplifiedControl.description', 'Gestión eficiente de tu parqueadero.')
    },
    {
      icon: <FaMobileAlt className="w-8 h-8" />,
      title: t('adminLanding.accessControlSystem.items.remoteAccess.title', 'Acceso desde cualquier lugar'),
      description: t('adminLanding.accessControlSystem.items.remoteAccess.description', 'Administra tu negocio donde estés.')
    }
  ];

  const elementsSystem = [
    {
      label: t('adminLanding.accessControlSystem.elementsSystem.simplifiedControl', 'Control de entradas y salidas simplificado'),
    },
    {
      label: t('adminLanding.accessControlSystem.elementsSystem.billingSystem', 'Sistema de facturación integrado'),
    },
    {
      label: t('adminLanding.accessControlSystem.elementsSystem.realtimeReports', 'Reportes y estadísticas en tiempo real'),
    },
    {
      label: t('adminLanding.accessControlSystem.elementsSystem.tariffManagement', 'Gestión flexible de tarifas'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Hero Section */}
      <main className="pt-16">
        <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 py-20 md:py-28">

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 text-center lg:text-left"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {t('adminLanding.hero.sectionTitle', 'Potencia tu parqueadero con ')}{' '}
                  <span className="text-amber-400">{t('adminLanding.hero.titleHighlighted', 'tecnología inteligente')}</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {t('adminLanding.hero.description', 'Únete a la red de parqueaderos más innovadora de Colombia y transforma la manera en que gestionas tu negocio.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/register">
                    <Button
                      variant="light"
                      className="px-8 py-4 bg-white text-primary hover:bg-white/90 transition-all duration-300 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      {t('adminLanding.hero.btn.startNow', 'Comenzar ahora')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300 rounded-xl font-semibold text-lg"
                  >
                    {t('adminLanding.hero.btn.scheduleDemo', 'Agendar demo')}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-3xl opacity-30 blur-xl animate-pulse" />
                <img
                  src={imgAdmin}
                  alt="Dashboard de administración"
                  className="relative rounded-2xl shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('adminLanding.features.title', 'Características diseñadas para tu éxito')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('adminLanding.features.description', 'Herramientas poderosas que transformarán la gestión de tu parqueadero')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:border-primary/20 transition-all duration-300 h-full">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <img
                  src={imgParkiu}
                  alt="Beneficios de ParkiÜ"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-12"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    {t('adminLanding.benefits.title', 'Beneficios que impulsan tu negocio')}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {t('adminLanding.benefits.description', 'Descubre cómo ParkiÜ puede ayudarte a optimizar tus operaciones y aumentar tus ingresos')}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Access Control System Section */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-3xl opacity-30 blur-xl" />
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="space-y-6">
                    {accessControlSystem.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-xl"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    {t('adminLanding.accessControlSystem.title', 'Gestión inteligente y simplificada')}
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    {t('adminLanding.accessControlSystem.description', 'Optimiza tus operaciones diarias con nuestra plataforma intuitiva. Diseñada para hacer la gestión de tu parqueadero más eficiente y rentable.')}
                  </p>
                  <ul className="space-y-4 mb-8">
                  {elementsSystem.map((element, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">✓</div>
                      {element.label}
                    </li>
                  ))}
                  </ul>

                  {/* Disclaimer */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-6 mb-8">
                    <h4 className="text-amber-800 font-semibold mb-2">{t('adminLanding.accessControlSystem.disclaimer.title', 'Próximamente')}</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      {t('adminLanding.accessControlSystem.disclaimer.description', 'Estamos trabajando en funcionalidades avanzadas como control automático de barreras e integración con sensores para brindarte una experiencia aún más completa.')}
                    </p>
                  </div>

                  <div className="mt-8">
                    <Button
                      variant="default"
                      className="px-8 py-4 "
                    >
                      {t('adminLanding.accessControlSystem.btn.seeAllFeatures', 'Ver todas las características')}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden">

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white mb-6"
              >
                {t('adminLanding.cta.title', '¿Listo para llevar tu parqueadero al siguiente nivel?')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 mb-8"
              >
                {t('adminLanding.cta.description', 'Únete a la red de parqueaderos más innovadora y comienza a ver resultados desde el primer día')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/register">
                  <Button
                    variant="light"
                    className="px-8 py-4 bg-white text-primary hover:bg-white/90 transition-all duration-300 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    {t('adminLanding.cta.btn.registerParking', 'Registrar mi parqueadero')}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300 rounded-xl font-semibold text-lg"
                >
                  {t('adminLanding.cta.btn.contactSales', 'Contactar a ventas')}
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLandingPage;
