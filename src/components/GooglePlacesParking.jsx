import { useCallback, useEffect, useState, memo } from 'react';
import { Car, MapPin, DollarSign, Clock, Star } from 'lucide-react';

// Extraer componentes para mejor rendimiento
const ParkingHeader = memo(({ name, isAvailable }) => (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary transition-colors">
        {name}
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
));

const ParkingInfo = memo(({ vicinity }) => (
  <div className="flex items-start gap-2 mb-3">
    <MapPin className="text-primary mt-1 flex-shrink-0 w-4 h-4" />
    <p className="text-sm text-gray-600 line-clamp-2">{vicinity}</p>
  </div>
));

const ParkingStats = memo(({ isAvailable, priceLevel }) => (
  <div className="grid grid-cols-2 gap-3">
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
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
      <DollarSign className="w-4 h-4 text-blue-600" />
      <div>
        <p className="text-sm font-medium">
          {priceLevel ? `Nivel ${priceLevel}` : 'Precio no disponible'}
        </p>
        <p className="text-xs opacity-75">
          Según Google
        </p>
      </div>
    </div>
  </div>
));

const ParkingCTA = memo(({ rating, isAvailable, onJoinClick }) => (
  <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {rating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{rating}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{isAvailable ? 'Abierto ahora' : 'Cerrado'}</span>
        </div>
      </div>
      <button
        onClick={onJoinClick}
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
));

// Componente principal optimizado
const GooglePlacesParking = ({ mapRef, center, radius = 1000 }) => {
  const [googleParkingSpots, setGoogleParkingSpots] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchNearbyParking = useCallback(() => {
    if (!mapRef.current || !center) return;

    setLoading(true);
    const service = new window.google.maps.places.PlacesService(mapRef.current);

    service.nearbySearch({
      location: new window.google.maps.LatLng(center.lat, center.lng),
      radius,
      type: ['parking']
    }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setGoogleParkingSpots(results);
      }
      setLoading(false);
    });
  }, [mapRef, center, radius]);

  useEffect(() => {
    if (mapRef.current && center) {
      const timeoutId = setTimeout(searchNearbyParking, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [mapRef, center, searchNearbyParking]);

  const handleJoinParkiu = useCallback((place) => {
    console.log('Unirse a Parkiu:', place);
  }, []);

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
              <ParkingHeader name={spot.name} isAvailable={isAvailable} />
              <ParkingInfo vicinity={spot.vicinity} />
              <ParkingStats isAvailable={isAvailable} priceLevel={spot.price_level} />
              <ParkingCTA
                rating={spot.rating}
                isAvailable={isAvailable}
                onJoinClick={() => handleJoinParkiu(spot)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Agregar displayName a los componentes memoizados
ParkingHeader.displayName = 'ParkingHeader';
ParkingInfo.displayName = 'ParkingInfo';
ParkingStats.displayName = 'ParkingStats';
ParkingCTA.displayName = 'ParkingCTA';

export default memo(GooglePlacesParking);
