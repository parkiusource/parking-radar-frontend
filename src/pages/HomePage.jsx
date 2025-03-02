import { useState, useEffect, memo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaAward, FaCalendarCheck, FaMoneyBillWave, FaComments, FaShieldAlt, FaChartLine, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { FaSquareParking } from 'react-icons/fa6';
import Footer from '@/components/Footer';
import { Button } from '@/components/common';
import { LuSearch, LuParkingSquare, LuLoader2, LuArrowRight, LuCompass } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import imgParkiu from '@/images/img_parkiu.webp';
import bgMapHero from '@/images/bg_map_hero.webp';
import { Header } from '@/components/Header';
import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import { SearchBox } from '@/components/SearchBox';
import PropTypes from 'prop-types';

// Datos constantes para evitar valores quemados en el código
const DEFAULT_RECENT_SEARCHES = ["Zona G", "Chapinero Alto"];

// Features del Hero
const HERO_FEATURES = [
  { icon: <FaMapMarkerAlt className="text-primary-300" />, text: "Disponibilidad en tiempo real" },
  { icon: <FaMoneyBillWave className="text-primary-300" />, text: "Tarifas actualizadas" },
  { icon: <FaComments className="text-primary-300" />, text: "Reseñas verificadas" },
  { icon: <FaShieldAlt className="text-primary-300" />, text: "Seguridad garantizada" }
];

// Beneficios para administradores
const ADMIN_BENEFITS = [
  { icon: <FaChartLine className="text-white text-xl" />, text: "Mayor visibilidad digital" },
  { icon: <FaUsers className="text-white text-xl" />, text: "Atrae nuevos clientes" },
  { icon: <FaMoneyBillWave className="text-white text-xl" />, text: "Optimiza tus ingresos" },
  { icon: <FaShieldAlt className="text-white text-xl" />, text: "Gestión simplificada" }
];

// Pasos de cómo funciona la app
const HOW_IT_WORKS_STEPS = [
  {
    icon: <FaSquareParking />,
    title: "Busca",
    description: "Encuentra parqueaderos verificados cerca de ti con disponibilidad e información actualizada"
  },
  {
    icon: <FaAward />,
    title: "Compara",
    description: "Analiza precios, valoraciones y servicios para elegir la mejor opción para ti"
  },
  {
    icon: <FaCalendarCheck />,
    title: "Contribuye",
    description: "Comparte tu experiencia y ayuda a otros conductores a tomar mejores decisiones"
  }
];

// Testimonios de usuarios
const TESTIMONIALS = [
  {
    name: "Carlos Ramírez",
    role: "Conductor",
    testimonial: "ParkiÜ me ha ahorrado mucho tiempo y estrés. Ahora encuentro parqueadero en minutos y puedo planificar mejor mis salidas."
  },
  {
    name: "María González",
    role: "Administradora de Parqueadero",
    testimonial: "Desde que registré mi parqueadero en ParkiÜ, he aumentado mis clientes en un 30%. La plataforma es intuitiva y fácil de usar."
  },
  {
    name: "Andrés Martínez",
    role: "Conductor frecuente",
    testimonial: "Las reseñas y comentarios me ayudan a elegir parqueaderos seguros. La información actualizada de disponibilidad es invaluable."
  }
];

// Meta información para SEO
const SEO_META = {
  title: "ParkiÜ - Encuentra el mejor parqueadero cerca de ti | Información en tiempo real",
  description: "ParkiÜ te ayuda a encontrar parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad, horarios y reseñas de parqueaderos cercanos a tu ubicación.",
  keywords: "parqueaderos, estacionamiento, parking, parqueo, lugares para parquear, tarifas parking, disponibilidad, seguridad",
  ogTitle: "ParkiÜ - Encuentra el mejor parqueadero cerca de ti",
  ogDescription: "Encuentra parqueaderos disponibles en tiempo real con información de tarifas, disponibilidad, horarios y reseñas.",
  canonical: "https://parkiu.app/"
};

// Componente optimizado del SearchBox para evitar re-renderizados innecesarios
const MemoizedSearchBox = memo(function MemoizedSearchBox(props) {
  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-full group shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 to-primary-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <SearchBox
          {...props}
          className={`pl-12 pr-12 py-4 w-full bg-white/95 backdrop-blur-md transition-all duration-300 group-hover:bg-white/98 border-0 font-medium ${props.className || ''}`}
        />
        <div className="absolute left-0 top-0 bottom-0 bg-primary rounded-l-full w-10 flex items-center justify-center">
          <span className="text-white text-xl pl-3">
            <LuSearch />
          </span>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <div className="text-xs text-gray-400 bg-gray-100/80 rounded-full px-2 py-0.5 hidden sm:flex items-center">
            <span className="font-bold mr-1">⌘</span>K
          </div>
        </div>
      </div>
    </div>
  );
});

MemoizedSearchBox.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

// Componente para renderizar un Feature en el hero con animación
const HeroFeature = ({ icon, text, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 + (index * 0.1) }}
    className="flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-md hover:bg-white/15 transition-colors group"
  >
    <span className="bg-primary-500 p-2 rounded-full text-white">{icon}</span>
    <span className="text-sm md:text-base whitespace-nowrap text-white font-medium group-hover:text-white/90">{text}</span>
  </motion.div>
);

HeroFeature.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchBoxRef = useRef(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  // Efecto para manejar clics fuera del campo de búsqueda
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };

    // Añadir listener para detectar clics fuera del campo
    document.addEventListener('mousedown', handleClickOutside);

    // Limpiar listener al desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Cargar búsquedas recientes desde localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error('Error parsing saved searches:', error);
        setRecentSearches(DEFAULT_RECENT_SEARCHES);
      }
    } else {
      // Utilizar valores por defecto si no hay búsquedas guardadas
      setRecentSearches(DEFAULT_RECENT_SEARCHES);
    }
  }, []);

  // Guardar búsquedas recientes en localStorage cuando cambien
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Función que maneja cuando se selecciona un lugar de la búsqueda
  const handlePlaceSelected = (place) => {
    setIsSearching(true);

    // Guardar la búsqueda en el historial reciente
    const searchText = place.displayName?.text || place;
    if (!recentSearches.includes(searchText)) {
      setRecentSearches(prev => [searchText, ...prev].slice(0, 3));
    }

    // Redirigir a la página de parking con las coordenadas del lugar seleccionado
    setTimeout(() => {
      setIsSearching(false);
      if (place.location) {
        // Si es un resultado de Google Places con coordenadas
        navigate(`/parking?search=${encodeURIComponent(place.displayName.text)}&lat=${place.location.latitude}&lng=${place.location.longitude}`);
      } else {
        // Si es solo texto (búsqueda manual o reciente)
        navigate(`/parking?search=${encodeURIComponent(place)}`);
      }
    }, 300);
  };

  const handleNearbySearch = () => {
    // Mostrar diálogo de confirmación en lugar de solicitar directamente la ubicación
    setShowLocationDialog(true);
  };

  const confirmLocationAccess = () => {
    if (navigator.geolocation) {
      // Mostrar estado de carga
      setIsSearching(true);
      setShowLocationDialog(false);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Redireccionar con las coordenadas
          const { latitude, longitude } = position.coords;
          // Inmediatamente redirigir a la página de parqueaderos
          navigate(`/parking?lat=${latitude}&lng=${longitude}&nearby=true`);
          // Resetear el estado de búsqueda después de la navegación
          setTimeout(() => setIsSearching(false), 300);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setIsSearching(false);

          // Mensajes de error más descriptivos según el tipo de error
          let errorMessage = "No pudimos acceder a tu ubicación. Por favor intenta de nuevo o busca manualmente.";

          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Has denegado el permiso para acceder a tu ubicación. Por favor habilita el acceso a ubicación en tu navegador e intenta de nuevo.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "La información de tu ubicación no está disponible en este momento. Por favor intenta de nuevo o busca manualmente.";
              break;
            case error.TIMEOUT:
              errorMessage = "Se agotó el tiempo para obtener tu ubicación. Verifica tu conexión a internet e intenta de nuevo.";
              break;
          }

          alert(errorMessage);
        },
        {
          enableHighAccuracy: false, // Cambiado a false para usar ubicación aproximada
          timeout: 8000,
          maximumAge: 0
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización. Por favor busca manualmente usando el campo de búsqueda.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{SEO_META.title}</title>
        <meta name="description" content={SEO_META.description} />
        <meta name="keywords" content={SEO_META.keywords} />
        <meta property="og:title" content={SEO_META.ogTitle} />
        <meta property="og:description" content={SEO_META.ogDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={SEO_META.canonical} />
      </Helmet>

      <Header />
      <main className="flex flex-col">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center relative pt-20 pb-12 md:py-12 bg-primary text-white overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 28, 61, 0.6), rgba(6, 28, 61, 0.7)), url(${bgMapHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/30 pointer-events-none" />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-6 flex flex-col items-center">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 md:mb-6 tracking-tight mx-auto max-w-3xl text-white drop-shadow-md"
            >
              Encuentra el parqueadero ideal en segundos
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl mb-10 md:mb-12 text-gray-100 max-w-2xl text-center drop-shadow"
            >
              Información en tiempo real sobre disponibilidad, tarifas y seguridad
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center w-full gap-6 max-w-xl mx-auto"
            >
              <div className="relative w-full" ref={searchBoxRef}>
                <MemoizedSearchBox
                  className="text-gray-700 text-base"
                  placeholder="Buscar por zona, dirección o referencia"
                  useSearchHook={useSearchPlaces}
                  onResultSelected={handlePlaceSelected}
                  onFocus={() => setShowRecentSearches(true)}
                />

                {isSearching && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <LuLoader2 className="text-primary-600 text-xl" />
                    </motion.div>
                  </div>
                )}

                {/* Búsquedas recientes */}
                <AnimatePresence>
                  {showRecentSearches && !isSearching && recentSearches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/30"
                    >
                      <div className="p-3">
                        <div className="text-xs text-gray-500 px-3 py-1 uppercase font-medium flex items-center mb-1">
                          <LuSearch className="mr-1.5 h-3 w-3" /> Búsquedas recientes
                        </div>
                        <div className="mt-1 max-h-48 overflow-y-auto px-1">
                          {recentSearches.map((search, index) => (
                            <motion.button
                              key={index}
                              whileTap={{ scale: 0.98 }}
                              whileHover={{ backgroundColor: "rgba(6, 28, 61, 0.05)" }}
                              className="w-full text-left px-4 py-3 text-gray-700 hover:text-primary rounded-lg flex items-center gap-3 text-sm transition-all"
                              onClick={() => {
                                handlePlaceSelected(search);
                                setShowRecentSearches(false);
                              }}
                            >
                              <span className="bg-primary-50 p-2 rounded-full text-primary">
                                <LuSearch className="h-4 w-4" />
                              </span>
                              <span className="font-medium">{search}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="w-full flex justify-center"
              >
                <Button
                  variant="outline"
                  onClick={handleNearbySearch}
                  disabled={isSearching}
                  className="relative overflow-hidden max-w-[440px] w-full flex items-center justify-center gap-x-3 bg-amber-500 text-white hover:bg-amber-600 px-7 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 group rounded-full shadow-lg hover:shadow-xl"
                  title="Utiliza tu ubicación actual para encontrar parqueaderos cercanos"
                  aria-label="Buscar parqueaderos cercanos utilizando tu ubicación actual"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/50 to-amber-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center gap-x-3">
                    {isSearching ? (
                      <>
                        <LuLoader2 className="animate-spin text-2xl" />
                        <span>Obteniendo ubicación...</span>
                      </>
                    ) : (
                      <>
                        <LuCompass className="text-2xl group-hover:animate-pulse" />
                        <span className="whitespace-nowrap tracking-wide uppercase">Encontrar cerca de mí</span>
                      </>
                    )}
                  </div>
                </Button>
              </motion.div>

              {/* Diálogo de confirmación de ubicación */}
              <AnimatePresence>
                {showLocationDialog && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md"
                    onClick={() => setShowLocationDialog(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl border border-white/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center mb-4">
                        <div className="mx-auto w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                          <LuParkingSquare className="text-primary text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Por qué necesitamos tu ubicación?</h3>
                        <p className="text-gray-600 mb-4">
                          Utilizaremos tu ubicación aproximada para mostrarte los parqueaderos más cercanos a ti.
                          Esto nos permite ofrecerte resultados relevantes sin tener que buscar manualmente.
                        </p>
                        <p className="text-sm text-gray-500 mb-5">
                          No almacenamos tu ubicación de forma permanente y solo la usamos para esta búsqueda.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => setShowLocationDialog(false)}
                          className="px-5 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                          variant="light"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={confirmLocationAccess}
                          className="px-5 py-2 bg-primary text-white hover:bg-primary-600"
                        >
                          Permitir acceso a ubicación
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap justify-center items-center gap-4 mt-12 md:mt-14">
                {HERO_FEATURES.map((feature, index) => (
                  <HeroFeature
                    key={index}
                    icon={feature.icon}
                    text={feature.text}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Admin Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-primary via-primary-700 to-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-10 md:gap-12"
            >
              <div className="flex flex-col justify-center max-w-xl gap-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white text-center md:text-left drop-shadow-md">
                  Potencia tu negocio con ParkiÜ
                </h2>
                <p className="text-lg md:text-xl leading-relaxed max-w-lg text-center md:text-left text-white/90 drop-shadow-md">
                  Aumenta tus ingresos y mejora la experiencia de tus clientes con nuestra plataforma especializada para administradores de parqueaderos
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-6">
                  {ADMIN_BENEFITS.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="bg-white/20 p-2 rounded-md">
                        {benefit.icon}
                      </div>
                      <span className="text-white font-medium">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center md:justify-start">
                  <Link to="/admin-landing">
                    <Button
                      variant="light"
                      className="px-6 md:px-8 py-3 md:py-4 font-semibold text-base md:text-lg shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl rounded-full"
                      aria-label="Registra tu parqueadero en nuestra plataforma"
                    >
                      Registrar mi parqueadero
                    </Button>
                  </Link>
                  <Link to="/login" className="text-white hover:text-white/80 transition-colors flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                    ¿Ya tienes cuenta? <span className="underline ml-2 font-medium">Iniciar sesión</span>
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full md:w-1/2 aspect-square max-w-md mt-6 md:mt-0"
              >
                <img
                  src={imgParkiu}
                  alt="Plataforma de administración de parqueaderos ParkiÜ"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 border-white/20"
                  loading="lazy"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-white" id="como-funciona">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-3xl md:text-4xl font-bold mb-10 md:mb-16 text-gray-900"
            >
              Cómo funciona ParkiÜ
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
              {HOW_IT_WORKS_STEPS.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-2xl flex items-center justify-center mb-5 md:mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <span className="text-4xl md:text-5xl text-white">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed px-2">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-14 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-gray-900"
            >
              Lo que dicen nuestros usuarios
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white p-5 md:p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <p className="text-gray-700 mb-4 italic text-base md:text-lg">&ldquo;{testimonial.testimonial}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Link to="/parking">
                <Button
                  className="group text-base md:text-lg px-6 py-3 bg-primary text-white hover:bg-primary-600 transition-colors inline-flex items-center gap-2 rounded-full"
                >
                  Comenzar a buscar parqueaderos
                  <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
