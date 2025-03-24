import { useState, useCallback } from 'react';

/**
 * Hook para manejar el estado de la ventana de información del mapa
 * @returns {Object} Estado y funciones para manejar la ventana de información
 * @property {boolean} infoWindowOpen - Estado de la ventana de información
 * @property {Object|null} selectedSpot - Parqueadero seleccionado
 * @property {Function} handleSpotSelect - Función para seleccionar un parqueadero
 * @property {Function} handleInfoWindowClose - Función para cerrar la ventana de información
 */
export const useInfoWindowState = () => {
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);

  const handleSpotSelect = useCallback((spot) => {
    setSelectedSpot(spot);
    setInfoWindowOpen(true);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowOpen(false);
    setSelectedSpot(null);
  }, []);

  return {
    infoWindowOpen,
    selectedSpot,
    handleSpotSelect,
    handleInfoWindowClose
  };
};
