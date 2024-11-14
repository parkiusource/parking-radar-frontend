import { GoogleMap, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { BiTargetLock } from 'react-icons/bi';
import { LuNavigation } from 'react-icons/lu';

import SvgParking from '@/assets/ComponentIcons/SvgParking';
import { Button } from '@/components/common';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LIBRARIES = ['marker'];
const DEFAULT_ZOOM = 15;
const DEFAULT_RADIUS = 30;
const DEFAULT_LOCATION = { lat: 4.711, lng: -74.0721 };
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;
const COLOR_NO_AVAILABLE = '#8B0000';
const COLOR_AVAILABLE = '#1B5E20';

const ParkingMap = memo(({ selectedSpot, setSelectedSpot }) => {
  const { parkingSpots, targetLocation, setTargetLocation } =
    useContext(ParkingContext);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userCircleRef = useRef(null);

  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user;

  const mapCenter = useMemo(
    () => userLocation || DEFAULT_LOCATION,
    [userLocation],
  );

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const zoomToLocation = useCallback((location) => {
    if (mapRef.current) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(DEFAULT_ZOOM);
      mapRef.current.setCenter(location);
    }
  }, []);

  const setUserLocation = useCallback(
    (location) => {
      updateUser({
        location,
      });
    },
    [updateUser],
  );

  const locateUser = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setTargetLocation(null);
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => console.error('Error fetching location:', error),
      { enableHighAccuracy: false },
    );
  };

  useEffect(() => {
    if (targetLocation) zoomToLocation(targetLocation);
  }, [targetLocation, zoomToLocation]);

  useEffect(() => {
    if (userLocation) {
      zoomToLocation(userLocation);

      if (userCircleRef.current) userCircleRef.current.setMap(null);
      userCircleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center: userLocation,
        radius: DEFAULT_RADIUS,
        strokeColor: '#4285F4',
        fillColor: '#4285F4',
        fillOpacity: 0.35,
      });
    }
  }, [userLocation, zoomToLocation]);

  const createMarkerContent = useCallback((spot) => {
    const markerContent = document.createElement('div');
    const color = spot.available_spaces > 0 ? COLOR_AVAILABLE : COLOR_NO_AVAILABLE;

    const root = createRoot(markerContent);

    root.render(
      <SvgParking style={{ width: '35px', height: '45px' }} fill={color} />
    );

    return markerContent;
  }, []);

  const initializeMarkers = useCallback(async () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // eslint-disable-next-line no-undef
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

    parkingSpots.forEach((spot) => {
      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: spot.latitude, lng: spot.longitude },
        title: spot.name,
        content: createMarkerContent(spot),
      });

      marker.addListener('click', () => {
        setSelectedSpot(spot);
        setInfoWindowOpen(true);
      });

      markersRef.current.push(marker);
    });
  }, [parkingSpots, setSelectedSpot, createMarkerContent]);

  useEffect(() => {
    if (isLoaded && mapRef.current) initializeMarkers();
    return () => markersRef.current.forEach((marker) => marker.setMap(null));
  }, [isLoaded, initializeMarkers]);

  useEffect(() => {
    if (selectedSpot) {
      const updatedSpot = parkingSpots.find(
        (spot) => spot.id === selectedSpot.id,
      );
      if (
        updatedSpot &&
        updatedSpot.available_spaces !== selectedSpot.available_spaces
      ) {
        setSelectedSpot(updatedSpot);
      }
    }
  }, [parkingSpots, selectedSpot, setSelectedSpot]);

  const handleMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      initializeMarkers();
    },
    [initializeMarkers],
  );

  const handleMapClick = useCallback(() => {
    setSelectedSpot(null);
    setInfoWindowOpen(false);
  }, [setSelectedSpot, setInfoWindowOpen]);

  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loadError) return <div>Error loading map.</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={mapCenter}
        zoom={targetLocation ? 20 : DEFAULT_ZOOM}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        options={{
          mapId: MAP_ID,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.LEFT_BOTTOM,
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          streetViewControl: false,
          disableDefaultUI: true,
        }}
      >
        <button
          onClick={locateUser}
          className="absolute top-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
        >
          <BiTargetLock size={24} />
        </button>

        {selectedSpot && infoWindowOpen && (
          <InfoWindowF
            className="gm-ui-hover-effect"
            position={{
              lat: selectedSpot.latitude,
              lng: selectedSpot.longitude,
            }}
            onCloseClick={() => setInfoWindowOpen(false)}
            options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
          >
            <div className="p-2 text-center space-y-1 flex flex-col gap-y-2">
              <h3 className="text-lg font-semibold">{selectedSpot.name}</h3>
              <p className='mt-0'>{`Address: ${selectedSpot.address}`}</p>
              <p
                className={`mt-0 font-medium ${selectedSpot.available_spaces > 0 ? 'text-dark-green-emerald' : 'text-dark-red-garnet'}`}
              >
                {`Available spaces: ${selectedSpot.available_spaces}`}
              </p>
              {selectedSpot.available_spaces > 0 && (
                <Button
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white flex gap-2 items-center mx-auto"
                  onClick={() =>
                    openNavigation(
                      selectedSpot.latitude,
                      selectedSpot.longitude,
                    )
                  }
                >
                  <LuNavigation /> Navigate
                </Button>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
});

ParkingMap.propTypes = {
  selectedSpot: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    address: PropTypes.string,
    available_spaces: PropTypes.number,
  }),
  setSelectedSpot: PropTypes.func.isRequired,
};

ParkingMap.displayName = 'ParkingMap';
export default ParkingMap;
