import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { LuCar, LuDollarSign, LuSearch, LuArrowLeft, LuInfo, LuMapPin, LuRoute } from 'react-icons/lu';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSwipeable } from 'react-swipeable';

import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import { useWebSocket } from '@/hooks/useWebSocket';
import ErrorBoundary from '@/components/ErrorBoundary';
import Map from '@/components/Map';
import { SearchBox } from '@/components/SearchBox';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';
import { useNearbyParkingSpots } from '@/hooks/useNearbySpots';
import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { useInView } from 'react-intersection-observer';

// Constantes
const DEFAULT_MAX_DISTANCE = 1000;
const DEFAULT_LIMIT = 10;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

// Hook personalizado para caché de búsqueda
const useLocationCache = () => {
  const [cache, setCache] = useState({});

  const getLocationCache = useCallback((lat, lng) => {
    const key = `${lat},${lng}`;
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [cache]);

  const setLocationCache = useCallback((lat, lng, data) => {
    const key = `${lat},${lng}`;
    setCache(prevCache => ({
      ...prevCache,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  return { getLocationCache, setLocationCache };
};

// Componente Skeleton mejorado con aria-label
const ParkingSpotSkeleton = () => (
  <div className="animate-pulse" aria-label="Cargando información del parqueadero">
    <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 w-8 h-8 rounded-full" />
          <div className="bg-gray-200 h-4 w-32 rounded" />
        </div>
        <div className="bg-gray-200 h-4 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-1 mb-4">
        <div className="bg-gray-200 h-3 w-full rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-200 h-8 rounded" />
        <div className="bg-gray-200 h-8 rounded" />
      </div>
    </div>
  </div>
);

// Componente optimizado del SearchBox con feedback táctil
const MemoizedSearchBox = React.memo(SearchBox);

// Componente ParkingSpotList optimizado con gestos táctiles y mejor accesibilidad
const ParkingSpotList = React.memo(({
  spots,
  selectedSpot,
  onSpotClick,
  setMobileListVisibility,
  setSelectedSpot,
  mapRef
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px'
  });

  // Estado para controlar qué tarjeta está expandida
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Estado para controlar el carrusel en móvil
  const [showMobileCarousel, setShowMobileCarousel] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Referencia para el contenedor del carrusel
  const carouselRef = useRef(null);

  // Detectar si estamos en móvil
  const isMobile = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      // En carrusel móvil, navegar a la siguiente tarjeta
      if (showMobileCarousel && currentCardIndex < spots.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        const target = eventData.event.target.closest('[data-parking-card]');
        if (target) {
          target.classList.add('translate-x-2');
          setTimeout(() => target.classList.remove('translate-x-2'), 300);
        }
      }
    },
    onSwipedRight: (eventData) => {
      // En carrusel móvil, navegar a la tarjeta anterior
      if (showMobileCarousel && currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
      } else {
        const target = eventData.event.target.closest('[data-parking-card]');
        if (target) {
          target.classList.add('-translate-x-2');
          setTimeout(() => target.classList.remove('-translate-x-2'), 300);
        }
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // Manejador para expandir/colapsar la tarjeta
  const handleCardExpand = useCallback((e, parkingId) => {
    e.stopPropagation();
    setExpandedCardId(expandedCardId === parkingId ? null : parkingId);
  }, [expandedCardId]);

  // Efecto para actualizar el índice actual cuando se selecciona un spot
  useEffect(() => {
    if (selectedSpot) {
      const index = spots.findIndex(spot => spot.id === selectedSpot.id);
      if (index !== -1) {
        setCurrentCardIndex(index);
      }
    }
  }, [selectedSpot, spots]);

  // Manejador para cambiar la tarjeta actual en el carrusel
  const handleCarouselNav = useCallback((index) => {
    setCurrentCardIndex(index);
    onSpotClick(spots[index]);
  }, [spots, onSpotClick]);

  // Manejador para mostrar el carrusel en móvil
  const handleCardClick = useCallback((parking) => {
    if (window.innerWidth < 768) {
      setShowMobileCarousel(true);
      setMobileListVisibility(true);
      const index = spots.findIndex(spot => spot.id === parking.id);
      if (index !== -1) {
        setCurrentCardIndex(index);
      }
    } else {
      // En desktop solo expandir/colapsar la card
      setExpandedCardId(expandedCardId === parking.id ? null : parking.id);
    }
    // Seleccionar el spot y centrar en el mapa
    onSpotClick(parking);
  }, [spots, onSpotClick, setMobileListVisibility, expandedCardId]);

  // Cerrar el carrusel móvil y volver a la lista
  const closeMobileCarousel = useCallback(() => {
    setShowMobileCarousel(false);
    setMobileListVisibility(false);
  }, [setMobileListVisibility]);

  if (!inView) {
    return <div ref={ref}>{Array(3).fill(null).map((_, i) => <ParkingSpotSkeleton key={i} />)}</div>;
  }

  if (spots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm"
        role="alert"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <LuInfo className="h-8 w-8 text-gray-400" aria-hidden="true" />
        </div>
        <h3 className="text-gray-700 font-medium mb-2">No encontramos parqueaderos</h3>
        <p className="text-gray-600 text-sm">
          No encontramos parqueaderos en esta zona. Intenta buscar en otra ubicación.
        </p>
      </motion.div>
    );
  }

  // Renderizar el carrusel móvil
  if (isMobile && showMobileCarousel && selectedSpot) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/70 flex flex-col" {...handlers}>
        {/* Cabecera del carrusel */}
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h3 className="font-medium text-lg">Parqueaderos</h3>
          <button
            onClick={closeMobileCarousel}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Cerrar carrusel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Contenedor del carrusel */}
        <div className="flex-1 overflow-hidden" ref={carouselRef}>
          <motion.div
            className="h-full flex transition-transform ease-out duration-300"
            animate={{
              x: `calc(-${currentCardIndex * 100}%)`
            }}
          >
            {spots.map((parking, index) => {
              const isSelected = currentCardIndex === index;

              return (
                <div
                  key={parking.id}
                  className="w-full h-full flex-shrink-0 overflow-y-auto pb-16 bg-gray-50"
                >
                  <div className={`mx-4 mt-4 bg-white rounded-xl shadow-sm border overflow-hidden ${
                    isSelected ? 'border-primary' : 'border-transparent'
                  }`}>
                    {/* Cabecera de la tarjeta */}
                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center flex-1">
                          <div className="bg-primary/10 p-2 rounded-full text-primary mr-3">
                            <LuCar className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <h3 className="font-medium text-gray-800 text-lg">
                            {parking.name}
                          </h3>
                        </div>

                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          parking.available_spaces > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {parking.available_spaces > 0 ? 'Disponible' : 'Lleno'}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm mt-3">
                        <LuMapPin className="mr-2 flex-shrink-0 text-gray-500" aria-hidden="true" />
                        <span>{parking.address}</span>
                      </div>

                      {/* Información básica */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center text-gray-700">
                          <div className="bg-blue-50 p-2 rounded-full text-blue-600 mr-3">
                            <LuCar className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <span className="font-medium">{parking.available_spaces} disponibles</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="bg-green-50 p-2 rounded-full text-green-600 mr-3">
                            <LuDollarSign className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <span className="font-medium">$60 a $100/min</span>
                        </div>
                        <div className="flex items-center text-gray-700 col-span-2 md:col-span-1">
                          <div className="bg-purple-50 p-2 rounded-full text-purple-600 mr-3">
                            <LuRoute className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <span className="font-medium">{parking.formattedDistance} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido detallado */}
                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      {/* Características */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3 text-base">Características</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          <div className="flex items-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                            </svg>
                            <span>Techado</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            <span>Seguridad 24h</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Personal en sitio</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 8v4l3 3"></path>
                            </svg>
                            <span>24 horas</span>
                          </div>
                        </div>
                      </div>

                      {/* Horarios */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3 text-base">Horario</h4>
                        <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 mb-2">
                          <span>Lunes a Viernes</span>
                          <span className="font-medium">6:00 AM - 10:00 PM</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 mb-2">
                          <span>Sábados</span>
                          <span className="font-medium">7:00 AM - 8:00 PM</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Domingos y festivos</span>
                          <span className="font-medium">8:00 AM - 6:00 PM</span>
                        </div>
                      </div>

                      {/* Tarifas */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3 text-base">Tarifas</h4>
                        <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 mb-2">
                          <span>Primera hora</span>
                          <span className="font-medium">$6.000</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 mb-2">
                          <span>Hora adicional</span>
                          <span className="font-medium">$4.000</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Día completo</span>
                          <span className="font-medium">$25.000</span>
                        </div>
                      </div>

                      {/* Calificación y reseñas */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700 text-base">Calificación</h4>
                          <div className="flex items-center bg-primary text-white px-3 py-1.5 rounded-lg">
                            <span className="font-bold text-base">4.8</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <div className="text-gray-600 italic">&ldquo;Excelente ubicación y muy seguro. El personal es muy amable.&rdquo;</div>
                          <div className="text-gray-500 mt-2 text-sm">Juan C. - hace 2 días</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Controles de navegación */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex flex-col space-y-4">
            {/* Paginación */}
            <div className="flex justify-center space-x-1 mb-2">
              {spots.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentCardIndex ? 'bg-primary' : 'bg-gray-300'}`}
                  onClick={() => handleCarouselNav(index)}
                  aria-label={`Ir a parqueadero ${index + 1}`}
                />
              ))}
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="bg-white border border-primary text-primary font-medium rounded-xl py-3 flex items-center justify-center transition-colors"
                onClick={() => {
                  // Lógica para reservar
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Reservar
              </button>

              <button
                className="bg-primary text-white font-medium rounded-xl py-3 flex items-center justify-center transition-colors"
                onClick={() => {
                  // Navegación a Google Maps
                  if (selectedSpot) {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.latitude},${selectedSpot.longitude}`, '_blank');
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                Navegar
              </button>
            </div>

            {/* Botón para volver a la lista */}
            <button
              className="mt-2 text-gray-600 font-medium py-2 flex items-center justify-center hover:text-primary transition-colors"
              onClick={closeMobileCarousel}
              aria-label="Volver a la lista de parqueaderos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista normal (escritorio y móvil sin carrusel)
  return (
    <div ref={ref} {...handlers}>
      {spots.map((parking) => {
        const isExpanded = expandedCardId === parking.id;
        const isSelected = selectedSpot?.id === parking.id;

        return (
        <motion.div
          key={parking.id}
          data-parking-card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          layout
          className={`mb-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-primary/30 hover:shadow-md transition-all transform overflow-hidden ${
            isSelected ? 'border-primary border-opacity-70 ring-2 ring-primary/20' : ''
          }`}
          onClick={() => handleCardClick(parking)}
          onKeyPress={(e) => e.key === 'Enter' && handleCardClick(parking)}
          tabIndex={0}
          role="button"
          aria-pressed={isSelected}
          aria-expanded={isExpanded}
          aria-label={`Parqueadero ${parking.name}, ${parking.available_spaces} espacios disponibles`}
        >
          {/* Cabecera de la tarjeta - Siempre visible */}
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center flex-1">
                <div className="bg-primary/10 p-1.5 rounded-full text-primary mr-2">
                  <LuCar className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="font-medium text-gray-800 text-base truncate">
                  {parking.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  parking.available_spaces > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {parking.available_spaces > 0 ? 'Disponible' : 'Lleno'}
                </span>

                <button
                  onClick={(e) => handleCardExpand(e, parking.id)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label={isExpanded ? "Mostrar menos información" : "Mostrar más información"}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </motion.div>
                </button>
              </div>
            </div>

            <div className="flex items-center text-gray-600 text-xs mt-2">
              <LuMapPin className="mr-1 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <span className="line-clamp-1">{parking.address}</span>
            </div>

            {/* Información básica siempre visible */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-center text-gray-700 text-sm">
                <div className="bg-blue-50 p-1.5 rounded-full text-blue-600 mr-2">
                  <LuCar className="w-4 h-4" aria-hidden="true" />
                </div>
                <span>{parking.available_spaces} disponibles</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <div className="bg-green-50 p-1.5 rounded-full text-green-600 mr-2">
                  <LuDollarSign className="w-4 h-4" aria-hidden="true" />
                </div>
                <span>$60 a $100/min</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm col-span-2 md:col-span-1">
                <div className="bg-purple-50 p-1.5 rounded-full text-purple-600 mr-2">
                  <LuRoute className="w-4 h-4" aria-hidden="true" />
                </div>
                <span>{parking.formattedDistance} km</span>
              </div>
            </div>
          </div>

          {/* Sección expandible con detalles adicionales */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-100 bg-gray-50 overflow-y-auto max-h-[50vh]"
              >
                <div className="p-4">
                  {/* Características del parqueadero */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">Características</h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                        </svg>
                        <span>Techado</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>Seguridad 24h</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>Personal en sitio</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4l3 3"></path>
                        </svg>
                        <span>24 horas</span>
                      </div>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">Horario</h4>
                    <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-1 mb-1">
                      <span>Lunes a Viernes</span>
                      <span className="font-medium">6:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-1 mb-1">
                      <span>Sábados</span>
                      <span className="font-medium">7:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Domingos y festivos</span>
                      <span className="font-medium">8:00 AM - 6:00 PM</span>
                    </div>
                  </div>

                  {/* Tarifas */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">Tarifas</h4>
                    <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-1 mb-1">
                      <span>Primera hora</span>
                      <span className="font-medium">$6.000</span>
                    </div>
                    <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-1 mb-1">
                      <span>Hora adicional</span>
                      <span className="font-medium">$4.000</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Día completo</span>
                      <span className="font-medium">$25.000</span>
                    </div>
                  </div>

                  {/* Calificación y reseñas */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-700 text-sm">Calificación</h4>
                      <div className="flex items-center bg-primary text-white px-2 py-1 rounded-lg">
                        <span className="font-bold text-sm">4.8</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-gray-600 italic">&ldquo;Excelente ubicación y muy seguro. El personal es muy amable.&rdquo;</div>
                      <div className="text-gray-500 mt-2 text-sm">Juan C. - hace 2 días</div>
                    </div>
                  </div>

                  {/* Botones de navegación */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${parking.latitude},${parking.longitude}`, '_blank');
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center active:bg-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                      </svg>
                      Navegar
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSpot(parking);
                        if (mapRef.current) {
                          mapRef.current.centerOnSpot(parking, true);
                        }
                      }}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center hover:bg-primary/90 active:bg-primary/80"
                    >
                      <LuInfo className="w-4 h-4 mr-1.5" />
                      Ver detalles
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mostrar indicador de selección si la tarjeta está seleccionada pero no expandida */}
          {isSelected && !isExpanded && (
            <div className="px-4 pb-3 text-xs text-primary-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>Seleccionado</span>
            </div>
          )}
        </motion.div>
      )})}
    </div>
  );
});

ParkingSpotList.displayName = 'ParkingSpotList';

// Componente ConnectionIndicator optimizado
const ConnectionIndicator = React.memo(({ isConnected }) => (
  <div className="flex items-center gap-2" role="status" aria-live="polite">
    <div
      className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-emerald-500' : 'bg-amber-500'
      }`}
    />
    <span className="text-xs font-medium hidden md:block">
      {isConnected ? (
        <span className="text-emerald-600">En línea</span>
      ) : (
        <span className="text-amber-600">Fuera de línea</span>
      )}
    </span>
  </div>
));

ConnectionIndicator.displayName = 'ConnectionIndicator';

export default function Parking() {
  const { t } = useTranslation();
  const { parkingSpots, targetLocation, setTargetLocation, invalidate, refetch } =
    useContext(ParkingContext);
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showConnectionMessage, setShowConnectionMessage] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const searchRef = useRef(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const mapRef = useRef(null);

  const { location: userLocation } = user;
  const [initialLocation, setInitialLocation] = useState(null);

  const { getLocationCache, setLocationCache } = useLocationCache();

  const [sortBy, setSortBy] = useState('distance');

  // Procesar los parámetros de URL al cargar el componente
  useEffect(() => {
    const handleLocationError = (error) => {
      console.error('Error getting location:', error);
      setIsLoadingLocation(false);
    };

    const processLocation = async (lat, lng) => {
      try {
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };

        // Intentar obtener datos del caché
        const cachedData = getLocationCache(lat, lng);

        if (cachedData) {
          setInitialLocation(cachedData.location);
          setTargetLocation(cachedData.location);
          if (cachedData.searchTerm) {
            setSearchTerm(cachedData.searchTerm);
          }
        } else {
          // Si no hay caché, proceder normalmente
          setInitialLocation(newLocation);
          setTargetLocation(newLocation);

          // Guardar en caché
          setLocationCache(lat, lng, {
            location: newLocation,
            searchTerm: searchTerm
          });
        }

        setIsLoadingLocation(false);
      } catch (error) {
        handleLocationError(error);
      }
    };

    const init = async () => {
      setIsLoadingLocation(true);
      const searchQuery = searchParams.get('search');
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const nearby = searchParams.get('nearby');

      setTargetLocation(null);
      setInitialLocation(null);

      if (searchQuery) {
        setSearchTerm(searchQuery);
      }

      if (lat && lng) {
        await processLocation(lat, lng);
        if (nearby === 'true') {
          setSearchTerm('Tu ubicación actual');
        }
      } else {
        setIsLoadingLocation(false);
      }
    };

    init();
  }, [searchParams, setTargetLocation, getLocationCache, setLocationCache, searchTerm]);

  // Memoize the WebSocket message handler to keep its reference stable
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'new-change-in-parking') {
      console.log('Received parking update, refreshing data...');
      invalidate();
      refetch();
    }
  }, [invalidate, refetch]);

  // Initialize WebSocket connection with real-time updates
  const { isConnected } = useWebSocket({
    onMessage: handleWebSocketMessage,
    // Only enable WebSocket when the component is mounted
    enabled: true
  });

  // Efecto para mostrar/ocultar el mensaje de conexión
  useEffect(() => {
    if (isConnected) {
      setShowConnectionMessage(true);
      const timer = setTimeout(() => {
        setShowConnectionMessage(false);
      }, 3000); // Ocultar después de 3 segundos
      return () => clearTimeout(timer);
    } else {
      setShowConnectionMessage(true);
    }
  }, [isConnected]);

  // Debugging para el estado de la vista móvil
  useEffect(() => {
    console.log("Mobile view state updated:", {
      isMobileListVisible,
      selectedSpot: selectedSpot ? selectedSpot.id : null,
      shouldShowCarousel: isMobileListVisible && selectedSpot,
      shouldShowList: !(isMobileListVisible && selectedSpot),
      windowWidth: window.innerWidth
    });
  }, [isMobileListVisible, selectedSpot]);

  // Memoizar el resultado de useNearbyParkingSpots para evitar recálculos
  const { nearbySpots } = useNearbyParkingSpots({
    spots: parkingSpots,
    center: targetLocation || userLocation,
    limit: DEFAULT_LIMIT,
    maxRadius: DEFAULT_MAX_DISTANCE,
  });

  // Agregar distancia a los parkingSpots sin modificar la referencia original
  const spotsWithDistance = useMemo(() => {
    if (!nearbySpots?.length) return [];
    return nearbySpots.map(spot => ({
      ...spot,
      formattedDistance: spot.distance ? (spot.distance / 1000).toFixed(1) : '~1.2'
    }));
  }, [nearbySpots]);

  // Ordenar los spots según el criterio seleccionado
  const sortedSpots = useMemo(() => {
    if (!spotsWithDistance.length) return [];

    const spots = [...spotsWithDistance];

    switch (sortBy) {
      case 'distance':
        return spots.sort((a, b) => parseFloat(a.formattedDistance) - parseFloat(b.formattedDistance));
      case 'price':
        // Asumiendo que el precio mínimo es el criterio de ordenamiento
        return spots.sort((a, b) => a.min_price - b.min_price);
      case 'rating':
        return spots.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'availability':
        return spots.sort((a, b) => b.available_spaces - a.available_spaces);
      default:
        return spots;
    }
  }, [spotsWithDistance, sortBy]);

  // Determinar el título según el tipo de búsqueda - Memoizado para evitar recálculos
  const getSectionTitle = useMemo(() => {
    if (isLoadingLocation) {
      return t('parking.loading', 'Buscando parqueaderos cercanos...');
    }

    if (!parkingSpots?.length) {
      return searchTerm
        ? t('parking.noResults', 'No se encontraron parqueaderos cerca de {{location}}', { location: searchTerm })
        : t('parking.noResultsDefault', 'No se encontraron parqueaderos cercanos');
    }

    return searchTerm
      ? t('parking.resultsFound', 'Parqueaderos cerca de {{location}}', { location: searchTerm })
      : t('parking.resultsFoundDefault', 'Parqueaderos cercanos');
  }, [isLoadingLocation, parkingSpots, searchTerm, t]);

  // Determinar el mensaje descriptivo - Memoizado para evitar recálculos
  const getDescriptiveMessage = useMemo(() => {
    if (!parkingSpots?.length) {
      return t('parking.tryDifferentLocation', 'Intenta con otra ubicación o amplía tu área de búsqueda');
    }

    return parkingSpots.length === 1
      ? t('parking.oneSpotFound', 'Se encontró {{count}} parqueadero en tu área', { count: 1 })
      : t('parking.multipleSpotFound', 'Se encontraron {{count}} parqueaderos en tu área', { count: parkingSpots.length });
  }, [parkingSpots, t]);

  const handleParkingSpotSelected = useCallback(({ spot }) => {
    setSelectedSpot(spot);

    // Si estamos en móvil, asegurarnos de que el carrusel muestre el spot correcto
    if (window.innerWidth < 768) {
      setIsMobileListVisible(true);
      // Encontrar el índice del spot seleccionado para el carrusel
      const spotIndex = spotsWithDistance.findIndex(p => p.id === spot.id);
      if (spotIndex !== -1 && swiperRef.current) {
        swiperRef.current.slideTo(spotIndex);
      }
    }
  }, [spotsWithDistance]);

  // Actualizar la función handleParkingCardClick
  const handleParkingCardClick = useCallback((parking) => {
    setSelectedSpot(parking);
    console.log("Spot seleccionado:", parking.id);

    // Centrar en el mapa y actualizar el estado
    if (mapRef.current) {
      mapRef.current.centerOnSpot(parking, false);
    }

    // Activar el carrusel en modo móvil si estamos en móvil
    if (window.innerWidth < 768) {
      setIsMobileListVisible(true);
      if (swiperRef.current) {
        const index = sortedSpots.findIndex(spot => spot.id === parking.id);
        if (index !== -1) {
          swiperRef.current.slideTo(index, 0, false);
        }
      }
    }
  }, [sortedSpots, setIsMobileListVisible]);

  // Función para manejar la selección de lugares personalizados en la búsqueda
  const handleCustomPlaceSelected = useCallback(
    (place) => {
      // Limpiar estados previos
      setSelectedSpot(null);
      setIsLoadingLocation(true);

      // Actualizar el estado de búsqueda
      if (place.displayName) {
        setSearchTerm(place.displayName.text);
      }

      // Crear la nueva ubicación
      const newLocation = {
        lat: place.location.latitude,
        lng: place.location.longitude,
      };

      // Resetear ubicaciones anteriores primero
      setTargetLocation(null);
      setInitialLocation(null);

      // Después de un pequeño retraso, establecer la nueva ubicación
      setTimeout(() => {
        // Actualizar en ambos estados
        setInitialLocation(newLocation);
        setTargetLocation(newLocation);
        setIsLoadingLocation(false);

        // Actualizar la URL para reflejar la nueva búsqueda sin recargar la página
        const newSearchParams = new URLSearchParams();
        if (place.displayName) {
          newSearchParams.set('search', place.displayName.text);
        }
        newSearchParams.set('lat', place.location.latitude);
        newSearchParams.set('lng', place.location.longitude);

        const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }, 100);
    },
    [setTargetLocation, setInitialLocation],
  );

  // Referencia para el Swiper
  const swiperRef = useRef(null);

  return (
    <div className="flex flex-col min-h-screen relative bg-gray-50">
      <style>
      {`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }

        /* Estilos personalizados para Swiper */
        .swiper {
          padding: 0.5rem;
          margin: 0 -0.5rem;
        }

        .swiper-slide {
          transition: all 0.3s ease;
        }

        .swiper-slide-active {
          transform: translateY(-2px);
        }

        .swiper-pagination {
          bottom: 0 !important;
        }

        .swiper-pagination-bullet {
          width: 4px;
          height: 4px;
          background: #E2E8F0;
          opacity: 1;
        }

        .swiper-pagination-bullet-active {
          background: var(--primary-color, #3B82F6);
          width: 16px;
          border-radius: 4px;
        }
      `}
      </style>
      <header className={getHeaderClassName({
        showShadow: true,
        className: 'z-10 backdrop-blur-md sticky top-0 bg-white/95 border-b border-gray-100/50 px-3 py-2 transition-all duration-300'
      })}>
        <Link to="/" className="flex items-center group" aria-label="Volver al inicio">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mr-3 md:hidden hover:text-primary transition-colors"
          >
            <LuArrowLeft className="text-gray-600 group-hover:text-primary transition-colors" aria-hidden="true" />
          </motion.div>
          <Logo variant="secondary" className="scale-90 md:scale-100" />
        </Link>

        <MemoizedSearchBox
          ref={searchRef}
          className="flex-1 max-w-xl mx-3"
          placeholder="Busca cerca a tu destino..."
          useSearchHook={useSearchPlaces}
          onResultSelected={handleCustomPlaceSelected}
          value={searchTerm}
          aria-label="Buscar ubicación"
        >
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
        </MemoizedSearchBox>

        <ConnectionIndicator isConnected={isConnected} />
      </header>

      <ErrorBoundary>
        <main className="flex-grow grid grid-cols-1 md:grid-cols-3 md:gap-4 relative overflow-hidden">
          {/* Show connection status messages */}
          <AnimatePresence>
            {showConnectionMessage && (
              <motion.div
                key={isConnected ? "connected" : "disconnected"}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
              >
                {isConnected ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">En línea</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-medium">Sin conexión</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLoadingLocation && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-medium">Obteniendo ubicación...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mapa - columna principal */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="col-span-2 h-[calc(100vh-56px)] relative overflow-hidden border border-gray-100/50 rounded-sm"
          >
            <div className="absolute inset-0 overflow-hidden">
              <ErrorBoundary>
                <Map
                  ref={mapRef}
                  onParkingSpotSelected={handleParkingSpotSelected}
                  selectedSpot={selectedSpot}
                  setSelectedSpot={setSelectedSpot}
                  targetLocation={initialLocation || targetLocation}
                  className="w-full h-full"
                />
              </ErrorBoundary>
            </div>

            {/* Pull-up handle para móvil */}
            <motion.div
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg flex flex-col"
              style={{
                zIndex: 999,
                borderRadius: "20px 20px 0 0",
                boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
                touchAction: "none",
                willChange: "transform",
                maxHeight: "85vh",
                overflow: "hidden"
              }}
              initial={{ y: "calc(100% - 180px)" }}
              animate={{
                y: isExpanded ? "calc(100% - 260px)" : "calc(100% - 180px)"
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
                mass: 1
              }}
              drag="y"
              dragConstraints={{
                top: window.innerHeight - 260,
                bottom: window.innerHeight - 180
              }}
              dragElastic={0.2}
              dragTransition={{
                bounceStiffness: 500,
                bounceDamping: 50,
                power: 0.3
              }}
              onDragEnd={(_, info) => {
                const currentY = info.point.y;
                const windowHeight = window.innerHeight;

                if (currentY < windowHeight - 220) {
                  setIsExpanded(true);
                } else if (currentY > windowHeight - 160) {
                  setIsExpanded(false);
                } else {
                  setIsExpanded(false);
                }
              }}
            >
              {/* Indicador de arrastre */}
              <div className="flex-shrink-0 flex flex-col items-center py-1.5">
                <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
              </div>

              {/* Contenido del pull-up */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Encabezado con contador de spots */}
                <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">
                      Parqueaderos cercanos
                    </h2>
                    <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {sortedSpots.length} disponibles
                    </span>
                  </div>
                </div>

                {/* Filtros */}
                {isExpanded && (
                  <div className="flex-shrink-0 flex gap-1.5 overflow-x-auto hide-scrollbar py-1.5 px-4 bg-white border-b border-gray-100">
                    <button
                      onClick={() => setSortBy('distance')}
                      className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        sortBy === 'distance'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <LuRoute className="w-3.5 h-3.5 mr-1" />
                      Más cercanos
                    </button>
                    <button
                      onClick={() => setSortBy('price')}
                      className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        sortBy === 'price'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <LuDollarSign className="w-3.5 h-3.5 mr-1" />
                      Menor precio
                    </button>
                    <button
                      onClick={() => setSortBy('availability')}
                      className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        sortBy === 'availability'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <LuCar className="w-3.5 h-3.5 mr-1" />
                      Disponibilidad
                    </button>
                  </div>
                )}

                {/* Lista de parqueaderos con scroll independiente */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <div className="p-4 space-y-3">
                    {/* Mostrar solo el primer spot cuando no está expandido */}
                    {!isExpanded ? (
                      sortedSpots.length > 0 && (
                        <div
                          onClick={() => {
                            setSelectedSpot(sortedSpots[0]);
                            if (mapRef.current) {
                              mapRef.current.centerOnSpot(sortedSpots[0], false);
                            }
                          }}
                          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-1.5 rounded-full">
                                <LuCar className="w-4 h-4 text-primary" />
                              </div>
                              <h3 className="font-medium text-gray-800">{sortedSpots[0].name}</h3>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              sortedSpots[0].available_spaces > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {sortedSpots[0].available_spaces > 0 ? `${sortedSpots[0].available_spaces} disponibles` : 'Lleno'}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 text-xs mb-2">
                            <LuMapPin className="w-3.5 h-3.5 mr-1" />
                            <span className="truncate">{sortedSpots[0].address}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center text-gray-600">
                              <LuRoute className="w-3.5 h-3.5 mr-1" />
                              <span>{sortedSpots[0].formattedDistance} km</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <LuDollarSign className="w-3.5 h-3.5 mr-1" />
                              <span>$60 - $100/min</span>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      // Mostrar todos los spots cuando está expandido
                      sortedSpots.map((parking) => (
                        <div
                          key={parking.id}
                          onClick={() => {
                            setSelectedSpot(parking);
                            if (mapRef.current) {
                              mapRef.current.centerOnSpot(parking, false);
                            }
                          }}
                          className={`bg-white rounded-xl p-3 shadow-sm border transition-all active:bg-gray-50 ${
                            selectedSpot?.id === parking.id
                              ? 'border-primary shadow-md'
                              : 'border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-1.5 rounded-full">
                                <LuCar className="w-4 h-4 text-primary" />
                              </div>
                              <h3 className="font-medium text-gray-800">{parking.name}</h3>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              parking.available_spaces > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {parking.available_spaces > 0 ? `${parking.available_spaces} disponibles` : 'Lleno'}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 text-xs mb-2">
                            <LuMapPin className="w-3.5 h-3.5 mr-1" />
                            <span className="truncate">{parking.address}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center text-gray-600">
                              <LuRoute className="w-3.5 h-3.5 mr-1" />
                              <span>{parking.formattedDistance} km</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <LuDollarSign className="w-3.5 h-3.5 mr-1" />
                              <span>$60 - $100/min</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Vista de escritorio */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="overflow-y-auto h-[calc(100vh-56px)] space-y-3 hidden md:block md:px-3"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {getSectionTitle}
              </h2>
              <p className="text-gray-600 text-sm">
                {getDescriptiveMessage}
              </p>

              {/* Filtros para desktop */}
              <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                <button
                  onClick={() => setSortBy('distance')}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    sortBy === 'distance'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <LuRoute className="w-4 h-4 mr-1.5" />
                  Más cercanos
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    sortBy === 'price'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <LuDollarSign className="w-4 h-4 mr-1.5" />
                  Menor precio
                </button>
                <button
                  onClick={() => setSortBy('availability')}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    sortBy === 'availability'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <LuCar className="w-4 h-4 mr-1.5" />
                  Disponibilidad
                </button>
              </div>
            </div>

            {/* Lista en desktop */}
            <div className="desktop-list pr-2">
              <ParkingSpotList
                spots={sortedSpots}
                selectedSpot={selectedSpot}
                onSpotClick={handleParkingCardClick}
                setMobileListVisibility={setIsMobileListVisible}
                setSelectedSpot={setSelectedSpot}
                mapRef={mapRef}
              />
            </div>
          </motion.section>
        </main>
      </ErrorBoundary>

      <footer className="py-3 px-4 bg-white border-t border-gray-100/50 text-center text-sm text-gray-500">
        <div className="container mx-auto flex flex-wrap justify-center items-center gap-6">
          <div className="font-medium">© {new Date().getFullYear()} ParkiÜ</div>
          <nav className="flex items-center gap-6">
            <Link to="/about" className="hover:text-primary transition-colors">Nosotros</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Términos</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
