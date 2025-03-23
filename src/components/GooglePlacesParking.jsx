import { useCallback, useEffect, useState } from 'react';
import { Car, MapPin, DollarSign, Clock, Star } from 'lucide-react';

const GooglePlacesParking = ({ mapRef, center, radius = 1000 }) => {
  const [googleParkingSpots, setGoogleParkingSpots] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchNearbyParking = useCallback(() => {
    if (!mapRef.current || !center) return;

    setLoading(true);
    const service = new window.google.maps.places.PlacesService(mapRef.current);

    const request = {
      location: new window.google.maps.LatLng(center.lat, center.lng),
      radius: radius,
      type: ['parking']
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setGoogleParkingSpots(results);
      }
      setLoading(false);
    });
  }, [mapRef, center, radius]);

  useEffect(() => {
    if (mapRef.current && center) {
      searchNearbyParking();
    }
  }, [mapRef, center, searchNearbyParking]);

  const createGoogleMarkerContent = useCallback((place) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'google-parking-marker';
    markerElement.style.cssText = `
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    `;

    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C12.0589 0 5.5 6.5589 5.5 14.5C5.5 20.0649 11.0557 28.5731 18.7882 33.7154C19.5127 34.2728 20.4873 34.2728 21.2118 33.7154C28.9443 28.5731 34.5 20.0649 34.5 14.5C34.5 6.5589 27.9411 0 20 0Z"
              fill="#4285F4"/>
        <circle cx="20" cy="14.5" r="10"
                fill="white"
                fill-opacity="0.9"/>
        <text x="20" y="18"
              font-family="Arial, sans-serif"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              fill="#4285F4">
          G
        </text>
      </svg>
    `;

    markerElement.innerHTML = svg;

    markerElement.addEventListener('mouseover', () => {
      markerElement.style.transform = 'scale(1.1) translateY(-2px)';
      markerElement.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
    });

    markerElement.addEventListener('mouseout', () => {
      markerElement.style.transform = 'scale(1) translateY(0)';
      markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
    });

    return markerElement;
  }, []);

  const handleJoinParkiu = (place) => {
    // Aquí puedes implementar la lógica para el CTA de unirse a Parkiu
    console.log('Unirse a Parkiu:', place);
  };

  if (loading) {
    return <div className="text-center py-4">Cargando parqueaderos cercanos...</div>;
  }

  return (
    <div className="space-y-3">
      {googleParkingSpots.map((spot) => {
        const isAvailable = spot.opening_hours?.isOpen();

        return (
          <div
            key={spot.place_id}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
          >
            <div className="p-4">
              {/* Header con indicador de fuente */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary transition-colors">
                    {spot.name}
                  </h3>
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-3 h-3"
                    />
                    Google Places
                  </span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isAvailable ? 'Disponible' : 'No Disponible'}
                </span>
              </div>

              {/* Información de ubicación */}
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="text-primary mt-1 flex-shrink-0 w-4 h-4" />
                <p className="text-sm text-gray-600 line-clamp-2">{spot.vicinity}</p>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-2 gap-3">
                {/* Estado de disponibilidad */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <Car className={`w-4 h-4 ${isAvailable ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="text-sm font-medium">
                      {isAvailable ? 'Abierto' : 'Cerrado'}
                    </p>
                    <p className="text-xs opacity-75">
                      Horario
                    </p>
                  </div>
                </div>

                {/* Información de precio */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {spot.price_level
                        ? `Nivel ${spot.price_level}`
                        : 'Precio no disponible'}
                    </p>
                    <p className="text-xs opacity-75">
                      Según Google
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA para unirse a Parkiu */}
              <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {spot.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{spot.rating}</span>
                      </div>
                    )}
                    {spot.opening_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{isAvailable ? 'Abierto ahora' : 'Cerrado'}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleJoinParkiu(spot)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <span>¿Eres el dueño?</span>
                    <span className="font-semibold">¡Únete a Parkiu!</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Gestiona tu parqueadero de manera inteligente y aumenta tus ingresos
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GooglePlacesParking;
