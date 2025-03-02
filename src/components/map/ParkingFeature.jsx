import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MarkerWithWindow } from './Map';
import { LuCar, LuMotorcycle, LuBike, LuMapPin, LuClock } from 'react-icons/lu';
import { Badge } from '@/components/common/Badge';

export function ParkingFeature({ parking, isSelected, onClick }) {
  const [isInfoOpen, setIsInfoOpen] = useState(isSelected);
  const [markerIcon, setMarkerIcon] = useState(null);

  const handleOpenInfo = () => {
    setIsInfoOpen(true);
    if (onClick) onClick();
  };

  const handleCloseInfo = () => {
    setIsInfoOpen(false);
  };

  useEffect(() => {
    // Solo configurar el icono cuando google esté definido
    if (window.google) {
      setMarkerIcon({
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createSvgMarker(parking.isActive, parking.name)),
        scaledSize: new window.google.maps.Size(50, 50),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(25, 50),
        labelOrigin: new window.google.maps.Point(25, 20),
      });
    }
  }, [parking.isActive, parking.name]);

  if (!markerIcon) return null;

  return (
    <MarkerWithWindow
      position={{
        lat: parseFloat(parking.coordinates.latitude),
        lng: parseFloat(parking.coordinates.longitude),
      }}
      info={<ParkingInfo parking={parking} />}
      isOpen={isInfoOpen}
      icon={markerIcon}
      onOpenWindow={handleOpenInfo}
      onCloseWindow={handleCloseInfo}
    />
  );
}

function createSvgMarker(isActive, name) {
  const color = isActive ? '#22c55e' : '#ef4444';
  const firstLetter = name ? name.charAt(0).toUpperCase() : 'P';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" width="54" height="54">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2"/>
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path fill="${color}" d="M27,2 C16.5,2 8,10.5 8,21 C8,25.8 9.7,30.2 12.5,33.5 C13.9,35.1 24.4,46.2 26.4,48.4 C26.6,48.7 27.4,48.7 27.6,48.4 C29.6,46.2 40.1,35.1 41.5,33.5 C44.3,30.2 46,25.8 46,21 C46,10.5 37.5,2 27,2 Z" />
        <circle fill="white" cx="27" cy="21" r="10"/>
        <text x="27" y="25" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="${color}">${firstLetter}</text>
      </g>
    </svg>
  `;
}

ParkingFeature.propTypes = {
  parking: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
};

function ParkingInfo({ parking }) {
  const formatPrice = (price) => {
    return Number(price).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="p-3 min-w-[250px] max-w-[300px] bg-white rounded-lg shadow-md">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{parking.name}</h3>
        {parking.isActive ? (
          <Badge variant="success" size="small">Abierto</Badge>
        ) : (
          <Badge variant="error" size="small">Cerrado</Badge>
        )}
      </div>

      <div className="flex items-center text-gray-600 text-xs mb-3">
        <LuMapPin className="mr-1 flex-shrink-0 text-gray-400" />
        <span>{parking.address}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-1.5 rounded">
          <LuCar className="mr-1.5 text-primary" />
          <span>{parking.distance.toFixed(1)} km</span>
        </div>
        <div className="flex items-center text-gray-700 text-sm bg-gray-50 p-1.5 rounded">
          <LuClock className="mr-1.5 text-primary" />
          <span className="font-medium">{formatPrice(parking.price)}</span>
          <span className="text-xs ml-1">/h</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-2 mt-2">
        <p className="text-xs text-gray-500 mb-1.5">Espacios disponibles:</p>
        <div className="flex space-x-3 text-sm text-gray-700">
          {parking.carSpaces > 0 && (
            <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
              <LuCar className="mr-1" />{parking.carSpaces}
            </div>
          )}
          {parking.motorcycleSpaces > 0 && (
            <div className="flex items-center bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
              <LuMotorcycle className="mr-1" />{parking.motorcycleSpaces}
            </div>
          )}
          {parking.bikeSpaces > 0 && (
            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
              <LuBike className="mr-1" />{parking.bikeSpaces}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ParkingInfo.propTypes = {
  parking: PropTypes.object.isRequired,
};
