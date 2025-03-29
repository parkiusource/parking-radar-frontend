import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Map from '@/components/Map';

const MapSection = forwardRef(({
  onParkingSpotSelected,
  selectedSpot,
  setSelectedSpot,
  targetLocation
}, ref) => {
  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:col-span-2">
      <Map
        ref={ref}
        onMarkerClick={onParkingSpotSelected}
        selectedSpot={selectedSpot}
        onSelectedSpotChange={setSelectedSpot}
        center={targetLocation}
      />
    </div>
  );
});

MapSection.displayName = 'MapSection';

MapSection.propTypes = {
  onParkingSpotSelected: PropTypes.func.isRequired,
  selectedSpot: PropTypes.object,
  setSelectedSpot: PropTypes.func.isRequired,
  targetLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

export default MapSection;
