import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import PropTypes from 'prop-types';
import { LuMapPin, LuArrowUpDown, LuCar, LuDollarSign } from 'react-icons/lu';
import { useEffect, useState, useRef } from 'react';
import { ParkingSpotList } from './ParkingSpotList';

export function MobileBottomSheet({
  spots,
  selectedSpot,
  sortBy,
  onSortChange,
  onSpotSelect,
  visible,
  onVisibilityChange,
  title,
  description,
}) {
  const controls = useAnimation();
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-50, 0, 200], [1, 1, 0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const carouselRef = useRef(null);

  // Altura inicial del bottom sheet (40% de la pantalla)
  const initialHeight = window.innerHeight * 0.4;
  // Altura expandida del bottom sheet (85% de la pantalla)
  const expandedHeight = window.innerHeight * 0.85;

  useEffect(() => {
    if (visible) {
      controls.start({
        y: isExpanded ? 0 : window.innerHeight - initialHeight,
        height: isExpanded ? expandedHeight : initialHeight,
        transition: {
          type: "spring",
          damping: 40,
          stiffness: 400
        }
      });
    } else {
      controls.start({ y: window.innerHeight });
    }
  }, [visible, controls, isExpanded, initialHeight, expandedHeight]);

  const handleDragEnd = (_, info) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      onVisibilityChange(false);
      setIsExpanded(false);
    } else if (velocity < -500 || offset < -100) {
      setIsExpanded(true);
    } else {
      setIsExpanded(isExpanded);
    }
  };

  const handleSpotClick = (spot) => {
    onSpotSelect(spot);
    setIsExpanded(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 md:hidden backdrop-blur-sm"
            onClick={() => onVisibilityChange(false)}
            style={{ opacity }}
          />

          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: window.innerHeight - initialHeight }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{ y: window.innerHeight }}
            exit={{ y: window.innerHeight }}
            style={{ y }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl md:hidden overflow-hidden"
          >
            {/* Barra de arrastre */}
            <div className="absolute top-0 left-0 right-0 h-8 flex justify-center items-center cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Contenido del bottom sheet */}
            <div className="h-full pt-8">
              {/* Vista expandida: Lista vertical */}
              {isExpanded ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <div>
                      <h2 className="text-lg font-semibold">{title}</h2>
                      {description && (
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-sm text-gray-500"
                    >
                      Ver menos
                    </button>
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-2 p-4 overflow-x-auto hide-scrollbar border-b border-gray-100">
                    <button
                      onClick={() => onSortChange('distance')}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                        sortBy === 'distance'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <LuArrowUpDown className="w-4 h-4 mr-1" />
                      Más cercanos
                    </button>
                    <button
                      onClick={() => onSortChange('price')}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                        sortBy === 'price'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Menor precio
                    </button>
                    <button
                      onClick={() => onSortChange('availability')}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                        sortBy === 'availability'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Disponibilidad
                    </button>
                  </div>

                  {/* Lista vertical de spots */}
                  <div className="flex-1 overflow-y-auto">
                    <ParkingSpotList
                      spots={spots}
                      selectedSpot={selectedSpot}
                      onSpotSelect={onSpotSelect}
                    />
                    {/* Espacio adicional al final */}
                    <div className="h-safe-area" />
                  </div>
                </div>
              ) : (
                <div className="px-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <LuMapPin className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-gray-600">
                        {spots.length} {spots.length === 1 ? 'disponible' : 'disponibles'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-sm text-primary font-medium"
                    >
                      Ver lista completa
                    </button>
                  </div>

                  {/* Carrusel horizontal de spots */}
                  <div
                    ref={carouselRef}
                    className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
                  >
                    {spots.map((spot) => (
                      <div
                        key={spot.id}
                        className="flex-none w-[280px] snap-start"
                        onClick={() => handleSpotClick(spot)}
                      >
                        <div className={`p-4 rounded-xl border ${
                          selectedSpot?.id === spot.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 bg-white'
                        } shadow-sm`}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              spot.isFull
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {spot.isFull ? 'Lleno' : 'Disponible'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <LuMapPin className="w-4 h-4" />
                            <span className="truncate">{spot.address}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <LuCar className="w-4 h-4 text-gray-500" />
                              <span>{spot.available_spaces} espacios</span>
                            </div>
                            <div className="flex items-center gap-1 font-medium text-primary">
                              <LuDollarSign className="w-4 h-4" />
                              <span>${spot.min_price}/hora</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

MobileBottomSheet.propTypes = {
  spots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      available_spaces: PropTypes.number.isRequired,
      min_price: PropTypes.number.isRequired,
      isFull: PropTypes.bool,
    })
  ).isRequired,
  selectedSpot: PropTypes.object,
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onSpotSelect: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  onVisibilityChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
