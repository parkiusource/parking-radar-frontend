import { GoogleMap, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BiTargetLock } from 'react-icons/bi';
import { Button } from '@/components/common';
import { LuNavigation } from 'react-icons/lu';
import { ParkingContext } from '@/context/ParkingContext';
import { UserContext } from '@/context/UserContext';
import availableIcon from '@/assets/available-parking.png';
import { debounce } from 'lodash';
import fullIcon from '@/assets/full-parking.png';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// Define the libraries required for Google Maps
const LIBRARIES = ['marker'];

// Component for rendering the map with parking spots
const Map = memo(({ selectedSpot, setSelectedSpot }) => {
  const { parkingSpots } = useContext(ParkingContext);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userCircleRef = useRef(null);

  const { user, updateUser } = useContext(UserContext);
  const { location: userLocation } = user;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // Ubicar al usuario y centrar el mapa en su posición
  const zoomToUserLocation = useCallback((location) => {
    console.log({ location });
    if (mapRef.current) {
      mapRef.current.setCenter(location);
      mapRef.current.setZoom(16); // Nivel de zoom al usuario
    }
  }, []);

  const setUserLocation = useCallback(
    (location) => {
      console.log('setUserLocation', { location });
      updateUser({
        location,
      });
    },
    [updateUser],
  );

  const locateUser = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => console.error('Error fetching location:', error),
      { enableHighAccuracy: true },
    );
  }, [setUserLocation]);

  // Locate the user and center the map on their position
  // Centrar el mapa en la ubicación del usuario cada vez que cambie
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(16);
      zoomToUserLocation();

      if (userCircleRef.current) userCircleRef.current.setMap(null);
      userCircleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center: userLocation,
        radius: 30,
        strokeColor: '#4285F4',
        fillColor: '#4285F4',
        fillOpacity: 0.35,
      });
    }
  }, [userLocation, zoomToUserLocation]);

  // Create marker content based on the spot's availability
  const createMarkerContent = useCallback((spot) => {
    const img = document.createElement('img');
    img.src = spot.available_spaces > 0 ? availableIcon : fullIcon;
    img.style.width = '35px';
    img.style.height = '45px';
    img.style.margin = '0';
    img.style.padding = '0';
    img.alt = spot.name;
    return img;
  }, []);

  // Initialize and render markers on the map
  const initializeMarkers = useCallback(async () => {
    markersRef.current.forEach((marker) => marker.setMap(null)); // Clear existing markers
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

      // Open the InfoWindow when the marker is clicked
      marker.addListener('click', () => {
        setSelectedSpot(spot);
        setInfoWindowOpen(true);
      });

      markersRef.current.push(marker);
    });
  }, [parkingSpots, setSelectedSpot, createMarkerContent]);

  // Reinitialize markers whenever the map loads or parking spots change
  useEffect(() => {
    if (isLoaded && mapRef.current) initializeMarkers();
    return () => markersRef.current.forEach((marker) => marker.setMap(null));
  }, [isLoaded, initializeMarkers]);

  // Synchronize `selectedSpot` with the latest data from `parkingSpots`
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

  // Handle map load event to initialize markers
  const handleMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      initializeMarkers();
    },
    [initializeMarkers],
  );

  // Open Google Maps navigation with the given latitude and longitude
  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Display error or loading state if needed
  if (loadError) return <div>Error loading map.</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  const mapCenter = userLocation || { lat: 4.711, lng: -74.0721 }; // Default map center

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={mapCenter}
        zoom={userLocation ? 15 : 12}
        onLoad={handleMapLoad}
        options={{
          mapId: '554ef11d99dc3101',
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.LEFT_BOTTOM,
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          streetViewControl: false,
        }}
      >
        <button
          onClick={debounce(locateUser, 300)} // Debounce to avoid multiple calls
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
            onCloseClick={() => setInfoWindowOpen(false)} // Close InfoWindow on click
            options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
          >
            <div className="p-2 text-center space-y-1">
              <h3 className="text-lg font-semibold">{selectedSpot.name}</h3>
              <p>{`Address: ${selectedSpot.address}`}</p>
              <p
                className={`font-medium ${selectedSpot.available_spaces > 0 ? 'text-green-500' : 'text-red-500'}`}
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

Map.displayName = 'Map';
export default Map;
