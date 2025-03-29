const MapSkeleton = () => {
  return (
    <div
      className="w-full h-[calc(100vh-4rem)] bg-gray-200 animate-pulse relative"
      role="status"
      aria-label="Cargando mapa"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-lg shadow-lg animate-pulse" />
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-lg shadow-lg animate-pulse" />
    </div>
  );
};

export default MapSkeleton;
