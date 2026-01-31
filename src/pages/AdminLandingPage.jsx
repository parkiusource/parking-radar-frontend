import { FaChartLine, FaUsers, FaMoneyBillWave, FaShieldAlt, FaClock, FaChartBar, FaMobileAlt, FaRegChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common';
import Footer from '@/components/layout/Footer';
import imgParkiu from '@/images/img-parking.webp';
import imgAdmin from '@/images/img-admin.webp';

const AdminLandingPage = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '✓', label: t('adminLanding.hero.stats.increaseOccupancy', 'Más ingresos garantizados') },
    { value: '15min', label: t('adminLanding.hero.stats.managementTime', 'Setup inicial') },
    { value: '100%', label: t('adminLanding.hero.stats.userSatisfaction', 'En la nube') },
    { value: '⚡', label: t('adminLanding.hero.stats.technicalSupport', 'Soporte rápido') }
  ];

  const features = [
    {
      icon: <FaChartLine className="w-7 h-7" />,
      number: '01',
      title: t('adminLanding.features.items.realtimeAnalytics.title', 'Analítica en tiempo real'),
      description: t('adminLanding.features.items.realtimeAnalytics.description', 'Dashboard completo con métricas de ocupación, ingresos y tendencias actualizadas al segundo.'),
      highlight: t('adminLanding.features.items.realtimeAnalytics.highlight', 'Sin esperas')
    },
    {
      icon: <FaUsers className="w-7 h-7" />,
      number: '02',
      title: t('adminLanding.features.items.customerManagement.title', 'Gestión inteligente'),
      description: t('adminLanding.features.items.customerManagement.description', 'Control de entradas/salidas, tarifas dinámicas y gestión de espacios desde cualquier dispositivo.'),
      highlight: t('adminLanding.features.items.customerManagement.highlight', '100% móvil')
    },
    {
      icon: <FaMoneyBillWave className="w-7 h-7" />,
      number: '03',
      title: t('adminLanding.features.items.financialControl.title', 'Más ingresos'),
      description: t('adminLanding.features.items.financialControl.description', 'Aparece en Google Maps y nuestra app para que conductores te encuentren fácilmente.'),
      highlight: t('adminLanding.features.items.financialControl.highlight', 'Mayor visibilidad')
    },
    {
      icon: <FaShieldAlt className="w-7 h-7" />,
      number: '04',
      title: t('adminLanding.features.items.advancedSecurity.title', 'Seguro y confiable'),
      description: t('adminLanding.features.items.advancedSecurity.description', 'Datos encriptados, respaldos automáticos y acceso seguro desde cualquier lugar.'),
      highlight: t('adminLanding.features.items.advancedSecurity.highlight', 'Protección total')
    }
  ];

  const benefits = [
    {
      icon: <FaClock className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.timeSavings.title', 'Ahorra tiempo valioso'),
      description: t('adminLanding.benefits.items.timeSavings.description', 'Automatización completa de entradas, salidas y facturación. Tu equipo puede enfocarse en lo que realmente importa.'),
      metric: 'Automatizado'
    },
    {
      icon: <FaChartBar className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.increasedVisibility.title', 'Aparece en Google Maps'),
      description: t('adminLanding.benefits.items.increasedVisibility.description', 'Conductores te encontrarán fácilmente cuando busquen parqueadero cerca de tu ubicación.'),
      metric: 'Más visibilidad'
    },
    {
      icon: <FaMobileAlt className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.mobileManagement.title', 'Controla desde tu celular'),
      description: t('adminLanding.benefits.items.mobileManagement.description', 'App móvil en desarrollo. Panel web completamente optimizado para móvil desde cualquier navegador.'),
      metric: '100% móvil'
    },
    {
      icon: <FaRegChartBar className="w-8 h-8" />,
      title: t('adminLanding.benefits.items.detailedReports.title', 'Datos en tiempo real'),
      description: t('adminLanding.benefits.items.detailedReports.description', 'Dashboard completo con métricas de ocupación, ingresos y tendencias actualizadas constantemente.'),
      metric: 'Tiempo real'
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
        <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 py-16 sm:py-20 md:py-28 lg:py-32">

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 text-center lg:text-left"
              >
                {/* Headline Principal */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-[1.1]">
                  {t('adminLanding.hero.sectionTitle', 'Aumenta tus ingresos con ')}{' '}
                  <span className="text-amber-400 block sm:inline">{t('adminLanding.hero.titleHighlighted', 'gestión inteligente')}</span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-8 leading-relaxed font-medium">
                  {t('adminLanding.hero.subheadline', 'El software inteligente para gestión de parqueaderos en Colombia. Sin instalaciones, sin hardware costoso.')}
                </p>

                {/* Bullets de beneficios */}
                <div className="mb-8 space-y-3">
                  <div className="flex items-start gap-3 text-white/90">
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-medium">
                      {t('adminLanding.hero.benefit1', 'Configuración en menos de 15 minutos - Sin curva de aprendizaje')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-medium">
                      {t('adminLanding.hero.benefit2', 'Visibilidad en Google Maps y nuestra app - Atrae más clientes')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-medium">
                      {t('adminLanding.hero.benefit3', 'Control total en tiempo real desde cualquier dispositivo')}
                    </p>
                  </div>
                </div>

                {/* Párrafo de cierre */}
                <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
                  {t('adminLanding.hero.closingText', 'Únete a los administradores que ya están transformando sus parqueaderos en negocios rentables y modernos. Comienza tu prueba gratuita de 30 días sin compromisos ni tarjeta de crédito.')}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                  <a
                    href="https://wa.me/573046824996?text=Hola!%20Quiero%20probar%20ParkiÜ%20gratis%20por%2030%20días%20para%20mi%20parqueadero%20🚀"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="light"
                      className="w-full px-8 py-4 bg-amber-400 text-primary-900 hover:bg-amber-300 transition-all duration-300 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      {t('adminLanding.hero.btn.startNow', '🚀 Prueba 30 días gratis')}
                    </Button>
                  </a>
                  <a
                    href="https://wa.me/573046824996?text=Hola!%20Me%20gustaría%20agendar%20una%20demo%20de%20ParkiÜ%20para%20mi%20parqueadero%20📅"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      className="w-full px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 rounded-xl font-semibold text-lg backdrop-blur-sm"
                    >
                      {t('adminLanding.hero.btn.scheduleDemo', '📅 Agendar demo gratis')}
                    </Button>
                  </a>
                </div>

                {/* Social Proof */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">✓</span>
                    <span>{t('adminLanding.hero.socialProof1', 'Prueba gratis 30 días')}</span>
                  </div>
                  <span className="hidden sm:inline text-white/40">•</span>
                  <span>{t('adminLanding.hero.socialProof2', 'Sin contratos de permanencia')}</span>
                  <span className="hidden sm:inline text-white/40">•</span>
                  <span>{t('adminLanding.hero.socialProof3', 'Cancela cuando quieras')}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 relative mt-12 lg:mt-0"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-3xl opacity-30 blur-xl animate-pulse" />
                <div className="relative bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
                  <img
                    src={imgAdmin}
                    alt="Dashboard de administración ParkiÜ"
                    className="relative rounded-xl shadow-2xl w-full h-auto transform hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>

                {/* Badge flotante */}
                <div className="absolute -bottom-6 -left-4 sm:left-4 bg-white rounded-xl shadow-xl p-4 border-2 border-primary/20 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">{t('adminLanding.hero.badge.label', 'Setup completo')}</div>
                      <div className="text-xl font-bold text-gray-900">15 min</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stats Section */}
            <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-amber-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/90 font-semibold text-sm sm:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
                {t('adminLanding.features.badge', 'TODO EN UNO')}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {t('adminLanding.features.title', 'Todo lo que necesitas para gestionar tu parqueadero')}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                {t('adminLanding.features.description', 'Sin complicaciones. Sin hardware costoso. Solo resultados desde el primer día.')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
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
                  <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-gray-100 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    {/* Número */}
                    <div className="text-5xl font-black text-primary/10 mb-4 leading-none">
                      {feature.number}
                    </div>

                    {/* Ícono */}
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-700 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-lg">
                      {feature.icon}
                    </div>

                    {/* Highlight badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-3 w-fit">
                      {feature.highlight}
                    </div>

                    {/* Título */}
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                      {feature.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-gray-600 leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 mb-8 lg:mb-0"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-3xl opacity-50 blur-xl" />
                  <img
                    src={imgParkiu}
                    alt="Beneficios de ParkiÜ - Dashboard en acción"
                    width={600}
                    height={400}
                    className="relative rounded-2xl shadow-2xl border-4 border-white w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-12"
                >
                  {/* Badge */}
                  <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
                    {t('adminLanding.benefits.badge', 'VENTAJA COMPETITIVA')}
                  </div>

                  {/* Headline */}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                    {t('adminLanding.benefits.title', 'Por qué los mejores parqueaderos eligen ParkiÜ')}
                  </h2>

                  {/* Subheadline */}
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                    {t('adminLanding.benefits.description', 'La única plataforma que te da visibilidad instantánea en Google Maps mientras automatizas toda tu operación.')}
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
                      className="group bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-primary to-primary-700 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md">
                          {benefit.icon}
                        </div>
                        <div className="flex-1">
                          <div className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded mb-2">
                            {benefit.metric}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Access Control System Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
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
                  {/* Badge */}
                  <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
                    {t('adminLanding.accessControlSystem.badge', 'FÁCIL Y RÁPIDO')}
                  </div>

                  {/* Headline */}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                    {t('adminLanding.accessControlSystem.title', 'Configura tu parqueadero en menos de 15 minutos')}
                  </h2>

                  {/* Subheadline */}
                  <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                    {t('adminLanding.accessControlSystem.description', 'Olvídate de instalaciones complicadas. Empieza a recibir clientes desde el primer momento.')}
                  </p>

                  {/* Bullets con números */}
                  <ul className="space-y-5 mb-10">
                  {elementsSystem.map((element, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-4 text-gray-800"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                        {index + 1}
                      </div>
                      <span className="text-base sm:text-lg font-medium leading-relaxed pt-1">
                        {element.label}
                      </span>
                    </li>
                  ))}
                  </ul>

                  {/* Párrafo de cierre */}
                  <p className="text-base text-gray-700 mb-8 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-200">
                    {t('adminLanding.accessControlSystem.closingText', 'Únete a los administradores que ya confían en ParkiÜ. Empieza tu prueba gratuita sin compromisos.')}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://wa.me/573046824996?text=Hola!%20Quiero%20comenzar%20con%20ParkiÜ%20gratis%20para%20mi%20parqueadero%20🚀"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="default"
                        className="w-full px-8 py-4 bg-gradient-to-r from-primary to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {t('adminLanding.accessControlSystem.btn.startFree', '🚀 Comenzar gratis')}
                      </Button>
                    </a>
                    <a
                      href="https://wa.me/573046824996?text=Hola!%20Me%20gustaría%20ver%20una%20demo%20de%20ParkiÜ%20📱"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl transition-all"
                      >
                        {t('adminLanding.accessControlSystem.btn.seeAllFeatures', 'Ver demo')}
                      </Button>
                    </a>
                  </div>

                  {/* Social proof */}
                  <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-green-600 font-semibold">✓</span>
                    {t('adminLanding.accessControlSystem.guarantee', 'Sin contratos de permanencia · Cancela cuando quieras')}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
                {t('adminLanding.pricing.badge', 'PRECIO TRANSPARENTE')}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {t('adminLanding.pricing.title', 'Un solo plan. Todo incluido.')}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                {t('adminLanding.pricing.description', 'Sin costos ocultos. Sin sorpresas. Cancela cuando quieras.')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border-2 border-primary/20 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-700 text-white text-center py-4">
                  <p className="text-lg font-bold">{t('adminLanding.pricing.badge2', '🎉 OFERTA DE LANZAMIENTO - 50% DE DESCUENTO')}</p>
                </div>

                <div className="p-8 sm:p-12">
                  <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Columna de precio */}
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {t('adminLanding.pricing.planName', 'Plan Profesional')}
                      </h3>

                      <div className="mb-6">
                        <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                          <span className="text-5xl sm:text-6xl font-extrabold text-gray-900">$34.950</span>
                          <span className="text-2xl text-gray-600">/mes</span>
                        </div>
                        <p className="text-gray-500 line-through text-lg">
                          {t('adminLanding.pricing.originalPrice', 'Precio regular: $69.900/mes')}
                        </p>
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                          <span className="text-xl">✓</span>
                          <span className="font-semibold">{t('adminLanding.pricing.guarantee1', 'Sin contratos de permanencia')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                          <span className="text-xl">✓</span>
                          <span className="font-semibold">{t('adminLanding.pricing.guarantee2', 'Cancela cuando quieras')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                          <span className="text-xl">✓</span>
                          <span className="font-semibold">{t('adminLanding.pricing.guarantee3', '30 días de prueba gratis')}</span>
                        </div>
                      </div>

                      <a
                        href="https://wa.me/573046824996?text=Hola!%20Quiero%20comenzar%20mi%20prueba%20gratis%20de%2030%20días%20con%20ParkiÜ%20🚀"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full px-8 py-5 bg-gradient-to-r from-primary to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-extrabold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                          {t('adminLanding.pricing.cta', '🚀 Comenzar prueba gratis')}
                        </Button>
                      </a>
                    </div>

                    {/* Columna de características */}
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-6">
                        {t('adminLanding.pricing.featuresTitle', 'Todo lo que necesitas incluido:')}
                      </h4>
                      <ul className="space-y-4">
                        {[
                          t('adminLanding.pricing.feature1', 'Espacios ilimitados'),
                          t('adminLanding.pricing.feature2', 'Hasta 3 usuarios'),
                          t('adminLanding.pricing.feature3', 'Visibilidad en Google Maps'),
                          t('adminLanding.pricing.feature4', 'Panel web optimizado para móvil'),
                          t('adminLanding.pricing.feature5', 'Dashboard en tiempo real'),
                          t('adminLanding.pricing.feature6', 'Reportes y analítica avanzada'),
                          t('adminLanding.pricing.feature7', 'Facturación automática'),
                          t('adminLanding.pricing.feature8', 'Tarifas dinámicas configurables'),
                          t('adminLanding.pricing.feature9', 'Soporte rápido por WhatsApp'),
                          t('adminLanding.pricing.feature10', 'Actualizaciones automáticas')
                        ].map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-primary font-bold">✓</span>
                            </div>
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border-t border-gray-200 px-8 sm:px-12 py-6 text-center">
                  <p className="text-gray-600">
                    {t('adminLanding.pricing.footer', '💳 No se requiere tarjeta de crédito para la prueba gratis · Empieza en menos de 15 minutos')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Comparación competitiva */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-16 text-center"
            >
              <p className="text-gray-600 mb-4">
                {t('adminLanding.pricing.comparison', '¿Por qué ParkiÜ vs. otros software?')}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">{t('adminLanding.pricing.vs1', 'Espacios ilimitados')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">{t('adminLanding.pricing.vs2', 'Visibilidad en Google Maps')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">{t('adminLanding.pricing.vs3', 'Optimizado para móvil')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">{t('adminLanding.pricing.vs4', '42% más económico')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden">

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge superior */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-amber-400/20 backdrop-blur-sm rounded-full text-amber-300 font-semibold text-sm mb-6 border border-amber-400/30"
              >
                {t('adminLanding.cta.badge', '🎉 OFERTA ESPECIAL · PRIMEROS 100 REGISTROS')}
              </motion.div>

              {/* Headline principal */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
              >
                {t('adminLanding.cta.title', 'Empieza gratis hoy. Ve resultados en 24 horas.')}
              </motion.h2>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-2xl text-white/95 mb-4 leading-relaxed max-w-3xl mx-auto"
              >
                {t('adminLanding.cta.description', 'Únete a los administradores que ya están generando más ingresos con ParkiÜ.')}
              </motion.p>

              {/* Mini bullets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/90 text-sm sm:text-base mb-10"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">✓</span>
                  <span>{t('adminLanding.cta.benefit1', 'Setup en 15 minutos')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">✓</span>
                  <span>{t('adminLanding.cta.benefit2', 'Sin tarjeta de crédito')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">✓</span>
                  <span>{t('adminLanding.cta.benefit3', 'Cancela cuando quieras')}</span>
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <a
                  href="https://wa.me/573046824996?text=Hola!%20Quiero%20probar%20ParkiÜ%20GRATIS%20por%2030%20días%20para%20mi%20parqueadero%20🚀"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial"
                >
                  <Button
                    variant="light"
                    className="w-full px-10 py-5 bg-amber-400 text-primary-900 hover:bg-amber-300 transition-all duration-300 rounded-xl font-extrabold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105"
                  >
                    {t('adminLanding.cta.btn.registerParking', '🚀 Prueba 30 días GRATIS')}
                  </Button>
                </a>
                <a
                  href="https://wa.me/573046824996?text=Hola!%20Me%20gustaría%20agendar%20una%20demo%20de%20ParkiÜ%20📅"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial"
                >
                  <Button
                    variant="outline"
                    className="w-full px-10 py-5 border-2 border-white/40 backdrop-blur-sm text-white hover:bg-white/10 transition-all duration-300 rounded-xl font-bold text-lg sm:text-xl"
                  >
                    {t('adminLanding.cta.btn.contactSales', '📅 Agendar demo')}
                  </Button>
                </a>
              </motion.div>

              {/* Social proof final */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-sm"
              >
                <p className="mb-2">
                  {t('adminLanding.cta.socialProof', '⚡ Administradores confiando en ParkiÜ · Sin contratos · Soporte incluido')}
                </p>
                <p className="text-white/60 text-xs">
                  {t('adminLanding.cta.guarantee', '100% gratis por 30 días. No se requiere tarjeta de crédito.')}
                </p>
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
