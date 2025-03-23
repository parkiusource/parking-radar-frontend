import { useState, useCallback } from 'react';

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
