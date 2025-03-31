import { forwardRef, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LuSearch, LuMapPin, LuX, LuLoader, LuChevronRight, LuTarget } from 'react-icons/lu';
import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export const SearchBox = forwardRef(function SearchBox(props, ref) {
  const { isOpen, setIsOpen, onSearch, className } = props;
  const [searchText, setSearchText] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const inputRef = useRef(null);

  const { results, isLoading } = useSearchPlaces(searchText, {
    languageCode: 'es',
  });

  const handleInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handlePlaceSelect = (place) => {
    setSearchText(place.displayName.text);
    setIsOpen(false);

    if (onSearch) {
      onSearch({
        lat: place.location.latitude,
        lng: place.location.longitude,
      });
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta la geolocalización');
      return;
    }

    setIsLocating(true);
    const toastId = toast.loading('Obteniendo tu ubicación...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (onSearch) {
          onSearch({
            lat: latitude,
            lng: longitude,
          });
        }
        toast.success('Ubicación obtenida correctamente', { id: toastId });
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = 'No se pudo obtener tu ubicación';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Necesitamos tu permiso para usar tu ubicación';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Tu ubicación no está disponible en este momento';
            break;
          case error.TIMEOUT:
            errorMessage = 'Se agotó el tiempo para obtener tu ubicación';
            break;
          default:
            errorMessage = 'Ocurrió un error al obtener tu ubicación';
        }

        toast.error(errorMessage, { id: toastId });
        setIsLocating(false);
        console.error("Error getting location: ", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div
      ref={ref ? ref : inputRef}
      className={`relative ${className || 'w-full max-w-md'}`}
    >
      <div className="relative">
        <motion.input
          type="text"
          placeholder="Busca cerca a tu destino..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onClick={handleInputClick}
          whileFocus={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <LuLoader className="text-primary" />
            </motion.div>
          ) : (
            <LuSearch />
          )}
        </div>

        {searchText ? (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={handleClearSearch}
            aria-label="Limpiar búsqueda"
          >
            <LuX />
          </button>
        ) : (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            title="Usar mi ubicación actual"
            aria-label="Usar mi ubicación actual"
          >
            {isLocating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <LuLoader className="text-primary" />
              </motion.div>
            ) : (
              <LuTarget />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto border border-gray-100"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-600 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <LuLoader className="text-primary" />
                </motion.div>
                <span>Buscando lugares...</span>
              </div>
            ) : results.length > 0 ? (
              <ul className="py-1">
                {results.map((place, index) => (
                  <motion.li
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start group transition-colors"
                    onClick={() => handlePlaceSelect(place)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 3 }}
                  >
                    <div className="bg-primary-50 p-1.5 rounded-full text-primary mr-3 flex-shrink-0">
                      <LuMapPin />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-gray-900">{place.displayName?.text}</div>
                      <div className="text-sm text-gray-600 line-clamp-1">
                        {place.formattedAddress}
                      </div>
                    </div>
                    <div className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0">
                      <LuChevronRight />
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : searchText ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-3">
                  <LuSearch className="text-gray-400" />
                </div>
                <p className="text-gray-600 mb-1">No se encontraron resultados</p>
                <p className="text-xs text-gray-500">Intenta con otro término de búsqueda</p>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-600">
                <p className="text-sm">Ingresa una ubicación para buscar</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SearchBox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  className: PropTypes.string,
};
