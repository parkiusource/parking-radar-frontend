import { useRef, useState, useCallback } from 'react';
import Map from '@/components/map/Map';
import ParkingSpotList from '@/components/parking/ParkingSpotList';

const Home = () => {
  const mapRef = useRef(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);

  const handleSpotSelect = useCallback((spot) => {
    setSelectedSpot(spot);
  }, []);

  const handleLocationChange = useCallback((spot) => {
    setSelectedSpot(spot);
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex-1 h-full">
        <Map
          ref={mapRef}
          onLocationChange={handleLocationChange}
          parkingSpots={parkingSpots}
          setParkingSpots={setParkingSpots}
        />
      </div>
      <div className="w-96 border-l border-gray-200">
        <ParkingSpotList
          spots={parkingSpots}
          onSpotSelect={handleSpotSelect}
          selectedSpot={selectedSpot}
          mapRef={mapRef}
        />
      </div>
    </div>
  );
};

export default Home;
