import { useState, useEffect, memo, useRef, useMemo, useCallback, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaAward, FaCalendarCheck, FaMoneyBillWave, FaComments, FaShieldAlt, FaChartLine, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { FaSquareParking } from 'react-icons/fa6';
import DarkFooter from '@/components/layout/Footer';
import { Button } from '@/components/common/Button/Button';
import { LuSearch, LuArrowRight, LuCompass } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import imgParkiu from '@/images/img_parkiu.webp';
import bgMapHero from '@/images/bg_map_hero.webp';
import { Header } from '@/components/layout/Header';
import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import { SearchBox } from '@/components/parking/SearchBox';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CircleParking, Loader2 } from 'lucide-react';

// Prefetch de la imagen de fondo del hero para evitar CLS (Cumulative Layout Shift)
const prefetchImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
};

const DEFAULT_RECENT_SEARCHES = ["Zona G", "Chapinero Alto"];

const MemoizedSearchBox = memo(forwardRef(function MemoizedSearchBox(props, ref) {
  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl group shadow-2xl hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-500">
        {/* Gradient border animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-amber-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-xy" />

        {/* Glass effect container */}
        <div className="relative bg-white/90 backdrop-blur-xl m-[1px] rounded-2xl overflow-hidden">
          <SearchBox
            {...props}
            ref={ref}
            useSearchHook={useSearchPlaces}
            className={`pl-16 pr-16 py-5 w-full bg-transparent transition-all duration-300 text-lg font-medium placeholder-gray-400 focus:placeholder-gray-300 ${props.className || ''}`}
          />

          {/* Animated search icon */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center">
            <div className="ml-4 p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white transform group-hover:scale-110 transition-all duration-500">
              <LuSearch className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          {/* Right side elements */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
            {/* Keyboard shortcut pill */}
            <div className="hidden sm:flex items-center gap-2 mr-4">
              <div className="flex items-center space-x-1 bg-gray-100/80 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">
                <kbd className="text-xs font-semibold text-gray-500 bg-white/80 px-1.5 py-0.5 rounded-md shadow-sm">⌘</kbd>
                <kbd className="text-xs font-semibold text-gray-500 bg-white/80 px-1.5 py-0.5 rounded-md shadow-sm">K</kbd>
              </div>
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1" />

            {/* Location button */}
            <button className="p-2 rounded-xl hover:bg-gray-100/80 text-primary-500 transition-colors" onClick={props.onLocationClick}>
              <LuCompass className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search suggestions animation enhancement */}
      <div className="absolute -inset-x-4 -inset-y-4 z-[-1] bg-gradient-to-r from-primary-500/20 via-amber-400/20 to-primary-600/20 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 animate-pulse" />
    </div>
  );
}));

MemoizedSearchBox.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  placeholder: PropTypes.string,
  onResultSelected: PropTypes.func,
  onFocus: PropTypes.func,
  onLocationClick: PropTypes.func
};

const styles = `
  @keyframes gradient-xy {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .animate-gradient-xy {
    background-size: 400% 400%;
    animation: gradient-xy 15s ease infinite;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

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
  const searchInputRef = useRef(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    prefetchImage(bgMapHero)
      .then(() => setHeroImageLoaded(true))
      .catch(err => {
        console.error('Error loading hero background:', err);
        setHeroImageLoaded(true);
      });
  }, []);

  const HERO_FEATURES = useMemo(() => [
    {
      icon: <FaMapMarkerAlt className="text-primary-300" />,
      text: t('hero.features.availability', 'Disponibilidad en tiempo real')
    },
    {
      icon: <FaMoneyBillWave className="text-primary-300" />,
      text: t('hero.features.rates', 'Tarifas actualizadas')
    },
    {
      icon: <FaComments className="text-primary-300" />,
      text: t('hero.features.reviews', 'Reseñas verificadas')
    },
    {
      icon: <FaShieldAlt className="text-primary-300" />,
      text: t('hero.features.security', 'Seguridad garantizada')
    }
  ], [t]);

  const STATS_CARDS = useMemo(() => [
    {
      value: "500+",
      label: t('stats.cards.parking.title', 'Parqueaderos'),
      description: t('stats.cards.parking.description', 'registrados en Bogotá'),
      icon: <CircleParking className="w-8 h-8" />
    },
    {
      value: "15K+",
      label: t('stats.cards.users.title', 'Usuarios'),
      description: t('stats.cards.users.description', 'activos mensuales'),
      icon: <FaUsers className="w-8 h-8" />
    },
    {
      value: "95%",
      label: t('stats.cards.satisfaction.title', 'Satisfacción'),
      description: t('stats.cards.satisfaction.description', 'de nuestros usuarios'),
      icon: <FaAward className="w-8 h-8" />
    },
    {
      value: "24/7",
      label: t('stats.cards.availability.title', 'Disponibilidad'),
      description: t('stats.cards.availability.description', 'servicio ininterrumpido'),
      icon: <FaShieldAlt className="w-8 h-8" />
    }
  ], [t]);

  const ADMIN_BENEFITS = useMemo(() => [
    {
      icon: <FaChartLine className="text-white text-xl" />,
      text: t('admin.benefits.visibility', 'Mayor visibilidad digital')
    },
    {
      icon: <FaUsers className="text-white text-xl" />,
      text: t('admin.benefits.clients', 'Atrae nuevos clientes')
    },
    {
      icon: <FaMoneyBillWave className="text-white text-xl" />,
      text: t('admin.benefits.income', 'Optimiza tus ingresos')
    },
    {
      icon: <FaShieldAlt className="text-white text-xl" />,
      text: t('admin.benefits.management', 'Gestión simplificada')
    }
  ], [t]);

  const HOW_IT_WORKS_STEPS = useMemo(() => [
    {
      icon: <FaSquareParking />,
      title: t('howItWorks.search.title', 'Busca'),
      description: t('howItWorks.search.description', 'Encuentra parqueaderos verificados cerca de ti con disponibilidad e información actualizada')
    },
    {
      icon: <FaAward />,
      title: t('howItWorks.compare.title', 'Compara'),
      description: t('howItWorks.compare.description', 'Analiza precios, valoraciones y servicios para elegir la mejor opción para ti')
    },
    {
      icon: <FaCalendarCheck />,
      title: t('howItWorks.contribute.title', 'Contribuye'),
      description: t('howItWorks.contribute.description', 'Comparte tu experiencia y ayuda a otros conductores a tomar mejores decisiones')
    }
  ], [t]);

  const TESTIMONIALS = useMemo(() => [
    {
      name: t('testimonials.carlos.name', 'Carlos Ramírez'),
      role: t('testimonials.carlos.role', 'Conductor'),
      testimonial: t('testimonials.carlos.text', 'ParkiÜ me ha ahorrado mucho tiempo y estrés. Ahora encuentro parqueadero en minutos y puedo planificar mejor mis salidas.')
    },
    {
      name: t('testimonials.maria.name', 'María González'),
      role: t('testimonials.maria.role', 'Administradora de Parqueadero'),
      testimonial: t('testimonials.maria.text', 'Desde que registré mi parqueadero en ParkiÜ, he aumentado mis clientes en un 30%. La plataforma es intuitiva y fácil de usar.')
    },
    {
      name: t('testimonials.andres.name', 'Andrés Martínez'),
      role: t('testimonials.andres.role', 'Conductor frecuente'),
      testimonial: t('testimonials.andres.text', 'Las reseñas y comentarios me ayudan a elegir parqueaderos seguros. La información actualizada de disponibilidad es invaluable.')
    }
  ], [t]);

  const SEO_META = useMemo(() => ({
    title: t('seo.title', 'ParkiÜ - Encuentra el mejor parqueadero cerca de ti | Información en tiempo real'),
    description: t('seo.description', 'ParkiÜ te ayuda a encontrar parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad, horarios y reseñas de parqueaderos cercanos a tu ubicación.'),
    keywords: t('seo.keywords', 'parqueaderos, estacionamiento, parking, parqueo, lugares para parquear, tarifas parking, disponibilidad, seguridad'),
    ogTitle: t('seo.ogTitle', 'ParkiÜ - Encuentra el mejor parqueadero cerca de ti'),
    ogDescription: t('seo.ogDescription', 'Encuentra parqueaderos disponibles en tiempo real con información de tarifas, disponibilidad, horarios y reseñas.'),
    canonical: "https://parkiu.app/"
  }), [t]);

  // Optimizamos las funciones reutilizando useCallback para evitar recreaciones innecesarias
  const handlePlaceSelected = useCallback((place) => {
    setIsSearching(true);

    // Guardar la búsqueda en el historial reciente
    const searchText = place.displayName?.text || place;
    if (searchText && !recentSearches.includes(searchText)) {
      setRecentSearches(prev => [searchText, ...prev].slice(0, 3));
    }

    // Redirigir a la página de parking con las coordenadas del lugar seleccionado
    setTimeout(() => {
      setIsSearching(false);
      if (place.location) {
        // Si es un resultado de Google Places con coordenadas
        const params = new URLSearchParams({
          search: place.displayName.text,
          lat: place.location.latitude.toString(),
          lng: place.location.longitude.toString(),
          zoom: '17',
          direct: 'true',
          source: 'search',
          timestamp: Date.now().toString() // Añadimos timestamp para forzar actualización
        });
        navigate(`/parking?${params.toString()}`);
      } else if (typeof place === 'string') {
        // Si es una búsqueda reciente o texto manual
        const params = new URLSearchParams({
          search: encodeURIComponent(place),
          type: 'text',
          direct: 'true',
          source: 'recent',
          timestamp: Date.now().toString() // Añadimos timestamp para forzar actualización
        });
        navigate(`/parking?${params.toString()}`);
      }
    }, 300);
  }, [navigate, recentSearches]);

  const handleNearbySearch = useCallback(() => {
    setShowLocationDialog(true);
  }, []);

  const confirmLocationAccess = useCallback(() => {
    if (navigator.geolocation) {
      setIsSearching(true);
      setShowLocationDialog(false);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Construir los parámetros de búsqueda
          const params = new URLSearchParams({
            lat: latitude.toString(),
            lng: longitude.toString(),
            zoom: '16', // Añadimos zoom para mejor precisión
            nearby: 'true',
            direct: 'true' // Indicador para centrado directo
          });
          // Navegar a la página de parking con los parámetros
          navigate(`/parking?${params.toString()}`);
          setTimeout(() => setIsSearching(false), 300);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setIsSearching(false);

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
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización. Por favor busca manualmente usando el campo de búsqueda.");
    }
  }, [navigate]);

  // Efecto para manejar clics fuera del campo de búsqueda
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Usamos un useEffect separado para las búsquedas recientes para mejor control
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recentSearches');

      if (savedSearches) {
        const parsedSearches = JSON.parse(savedSearches);
        if (Array.isArray(parsedSearches) && parsedSearches.length > 0) {
          setRecentSearches(parsedSearches);
        } else {
          setRecentSearches(DEFAULT_RECENT_SEARCHES);
        }
      } else {
        setRecentSearches(DEFAULT_RECENT_SEARCHES);
      }
    } catch (error) {
      console.error('Error parsing saved searches:', error);
      setRecentSearches(DEFAULT_RECENT_SEARCHES);
    }
  }, []);

  // Guardar búsquedas recientes en localStorage cuando cambien
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Función optimizada para manejar el foco en el cuadro de búsqueda
  const handleSearchFocus = useCallback(() => {
    setShowRecentSearches(true);
  }, []);

  const RecentSearchesPanel = useMemo(() => {
    if (!showRecentSearches || isSearching || recentSearches.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute z-20 top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/30"
      >
        <div className="p-3">
          <div className="text-xs text-gray-500 px-3 py-1 uppercase font-medium flex items-center mb-1">
            <LuSearch className="mr-1.5 h-3 w-3" /> {t('search.recentSearches', 'Búsquedas recientes')}
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
    );
  }, [showRecentSearches, isSearching, recentSearches, handlePlaceSelected, t]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Helmet>
        <title>{SEO_META.title}</title>
        <meta name="description" content={SEO_META.description} />
        <meta name="keywords" content={SEO_META.keywords} />
        <meta property="og:title" content={SEO_META.ogTitle} />
        <meta property="og:description" content={SEO_META.ogDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={SEO_META.canonical} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <Header />
      <main className="flex flex-col">
        {/* Hero Section - Enhanced with parallax and interactive elements */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: heroImageLoaded ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center pt-20 pb-12 md:pt-28 md:pb-20 overflow-hidden"
        >
          {/* Dynamic Background with Parallax */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
            style={{
              backgroundImage: heroImageLoaded ?
                `linear-gradient(to bottom, rgba(7, 89, 133, 0.85), rgba(7, 89, 133, 0.9)), url(${bgMapHero})` :
                'linear-gradient(to bottom ,rgba(7, 89, 133, 0.85), rgba(7, 89, 133, 0.9))',
              transform: 'scale(1.1)',
            }}
          >
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center">
            {/* Main Hero Content - Enhanced */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                <span className="block mb-2">{t('hero.title', 'Encuentra el parqueadero')}</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
                  {t('hero.titleHighlighted', 'ideal en segundos')}
                </span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
                {t('hero.subtitle', 'Información en tiempo real sobre disponibilidad, tarifas y seguridad')}
              </p>
            </motion.div>

            {/* Search Section - Refined */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-full max-w-2xl mx-auto mb-20"
            >
              <div className="relative mb-6" ref={searchBoxRef}>
                <MemoizedSearchBox
                  className="text-gray-700 text-lg"
                  placeholder={t('search.placeholder', 'Buscar por zona, dirección o referencia')}
                  onResultSelected={handlePlaceSelected}
                  onFocus={handleSearchFocus}
                  onLocationClick={handleNearbySearch}
                  ref={searchInputRef}
                />

                {isSearching && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader2 className="text-primary-600 text-xl" />
                    </motion.div>
                  </div>
                )}

                <AnimatePresence>
                  {RecentSearchesPanel}
                </AnimatePresence>
              </div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <Button
                  variant="outline"
                  onClick={handleNearbySearch}
                  disabled={isSearching}
                  className="relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-x-3 bg-amber-500 text-white hover:bg-amber-600 px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105 group rounded-full shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/50 to-amber-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center gap-x-3">
                    {isSearching ? (
                      <>
                        <Loader2 className="animate-spin text-2xl" />
                        <span>Obteniendo ubicación...</span>
                      </>
                    ) : (
                      <>
                        <LuCompass className="text-2xl group-hover:animate-pulse" />
                        <span className="whitespace-nowrap">{t('hero.findNow', 'Encontrar cerca de mí')}</span>
                      </>
                    )}
                  </div>
                </Button>

                <Link to="/parking" className="w-full sm:w-auto">
                  <Button
                    variant="light"
                    className="w-full px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-full font-medium flex items-center justify-center gap-2"
                  >
                    <LuSearch className="text-xl" />
                    <span>{t('hero.btn.seeAllParkingLots', 'Ver todos los parqueaderos')}</span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Features Grid - Simplified */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
              {HERO_FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 border border-white/20" />
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl transform group-hover:scale-105 transition-transform duration-300 p-6 h-full overflow-hidden flex items-center gap-4">
                    <div className="bg-gradient-to-br from-primary-400 to-primary-600 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white text-2xl">
                        {feature.icon}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg group-hover:text-white/90 transition-colors">
                      {feature.text}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats Section - Enhanced with realistic numbers and better design */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent" />
          </div>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto relative z-10">
              {STATS_CARDS.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-50/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </div>
                    <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-gray-600">{stat.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Admin Section - Enhanced */}
        <section className="py-24 bg-gradient-to-b from-primary-600 to-primary-800 relative overflow-hidden">

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-8 lg:gap-16"
            >
              <div className="flex-1 max-w-xl">
                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {t('admin.sectionTitle', 'Potencia tu negocio con') + ' '}
                    <span className="text-amber-400">ParkiÜ</span>
                  </h2>
                  <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                    {t('admin.description', 'Únete a la red de parqueaderos más grande y moderna. Optimiza tus operaciones y aumenta tus ingresos.')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {ADMIN_BENEFITS.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 sm:gap-2 lg:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-2 mb:p-4 border border-white/20"
                    >
                      <div className="bg-white/20 p-2 mb:p-3 rounded-lg">
                        {benefit.icon}
                      </div>
                      <span className="text-white font-medium">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/admin-landing" className="flex-1">
                    <Button
                      variant="light"
                      className="w-full px-4 lg:px-6 py-4 bg-white text-primary hover:bg-white/90 transition-all duration-300 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      {t('admin.btn.manageParking', 'Administrar mi parqueadero')}
                    </Button>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <Button
                      variant="dark"
                      className="w-full px-4 lg:px-6 py-4 bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-xl font-semibold text-lg"
                    >

                      {t('admin.btn.login', 'Iniciar sesión')}
                    </Button>
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex-1 max-w-lg"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-3xl opacity-30 blur-xl animate-pulse" />
                  <img
                    src={imgParkiu}
                    alt="Plataforma de administración ParkiÜ"
                    className="relative rounded-2xl shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works - Enhanced */}
        <section className="py-24 bg-white relative overflow-hidden" id="como-funciona">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              {t('howItWorks.sectionTitle', 'Potencia tu negocio con ParkiÜ')}
              </h2>
              <p className="text-xl text-gray-600">
              {t('howItWorks.subtitle', 'Encuentra, compara y reserva parqueaderos de forma rápida y segura')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
                  <div className="relative flex flex-col items-center bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:border-primary/20 transition-all duration-300 h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary text-3xl">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials - Enhanced */}
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                {t('testimonials.sectionTitle', 'Lo que dicen nuestros usuarios')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('testimonials.subtitle', 'Miles de conductores y administradores confían en ParkiÜ')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-100 hover:border-primary/20 transition-all duration-300 h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-primary">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      &ldquo;{testimonial.testimonial}&rdquo;
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <Link to="/parking">
                <Button
                  className="group px-8 py-4 bg-primary text-white hover:bg-primary-600 transition-all duration-300 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-3"
                >
                  {t('testimonials.btn.startLooking', 'Comenzar a buscar parqueaderos')}
                  <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - New */}
        <section className="py-20 bg-gradient-to-b from-primary-600 to-primary-800 relative overflow-hidden">

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                {t('ctaSection.sectionTitle', '¿Listo para encontrar tu parqueadero ideal?')}
              </motion.h2>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/90 mb-8"
              >
                {t('ctaSection.subtitle', 'Join thousands of drivers already enjoying a stress-free parking experience')}
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-8 justify-center"
              >
                <Button
                  onClick={handleNearbySearch}
                  className="px-8 py-4 bg-amber-400 text-white hover:bg-amber-600 transition-all duration-300 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <LuCompass className="text-2xl" />
                  {t('ctaSection.btn.findNearbyParking', 'Encontrar parqueaderos cercanos')}
                </Button>
                <Link to="/admin-landing">
                  <Button
                    variant="light"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-xl text-lg font-semibold"
                  >
                    {t('ctaSection.btn.manageParking', 'Administrar mi parqueadero')}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Expansion Section - Cities */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto gap-12">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-xl"
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  {t('expansionSection.sectionTitle', 'Encuentra parqueaderos en ')}
                    <span className="text-primary">Colombia</span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {t('expansionSection.subtitle', 'Iniciamos en Bogotá y estamos expandiéndonos a las principales ciudades del país para brindarte la mejor experiencia de parqueo donde quiera que vayas.')}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FaMapMarkerAlt className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">{t('expansionSection.availableNow', 'Disponible ahora')}</h3>
                        <p className="text-gray-600">Bogotá D.C.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FaMapMarkerAlt className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">{t('expansionSection.comingSoon', 'Próximamente')}</h3>
                        <p className="text-gray-600">Medellín • Cali • Barranquilla</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-3xl opacity-30 blur-xl" />
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-gray-100">
                      <svg className="absolute inset-0 w-full h-full text-primary/10" viewBox="0 0 800 600">
                        <path d="M400,150 Q550,150 550,300 T400,450 T250,300 T400,150" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="400" cy="300" r="8" fill="currentColor"/>
                        <circle cx="400" cy="150" r="8" fill="currentColor"/>
                        <circle cx="550" cy="300" r="8" fill="currentColor"/>
                        <circle cx="400" cy="450" r="8" fill="currentColor"/>
                        <circle cx="250" cy="300" r="8" fill="currentColor"/>
                        <text x="400" y="140" textAnchor="middle" fill="currentColor" fontSize="14">Bogotá</text>
                        <text x="560" y="300" textAnchor="start" fill="currentColor" fontSize="14">Medellín</text>
                        <text x="400" y="470" textAnchor="middle" fill="currentColor" fontSize="14">Cali</text>
                        <text x="240" y="300" textAnchor="end" fill="currentColor" fontSize="14">Barranquilla</text>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-primary rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-3xl font-bold text-primary mb-1">4+</div>
                        <div className="text-gray-600 text-sm">{t('expansionSection.majorCities', 'Ciudades principales')}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-3xl font-bold text-primary mb-1">1M+</div>
                        <div className="text-gray-600 text-sm">{t('expansionSection.potentialDrivers', 'Conductores potenciales')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <DarkFooter />

      {/* Location Dialog - Enhanced */}
      <AnimatePresence>
        {showLocationDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center text-white text-4xl transform rotate-12 shadow-xl">
                  <CircleParking />
                </div>
              </div>

              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('locationDialog.title', '¿Por qué necesitamos tu ubicación?')}
                </h3>
                <p className="text-gray-600 mb-3">
                {t('locationDialog.description', 'Para mostrarte los parqueaderos más cercanos a tu ubicación actual y brindarte la mejor experiencia posible.')}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                {t('locationDialog.privacy', 'No almacenamos tu ubicación, solo la usamos para esta búsqueda.')}
                </p>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowLocationDialog(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-base font-medium"
                  >
                    {t('locationDialog.btn.cancel', 'Cancelar')}
                  </Button>
                  <Button
                    onClick={confirmLocationAccess}
                    className="px-6 py-3 bg-primary text-white hover:bg-primary-600 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                    {t('locationDialog.btn.allow', 'Permitir acceso')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
