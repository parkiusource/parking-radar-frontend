import { useState } from 'react';

import { LuMinus, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { CardContent, CardFooter, CardHeader } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';

import { getHeaderclassName } from '@/components/Header';
import Logo from '@/components/Logo';
import { ParkingFormDialog } from '@/components/ParkingForm';

export default function Admin() {
  const [parkingPlaces, setParkingPlaces] = useState([
    {
      id: 1,
      name: 'Antonio Nariño',
      address: 'Cl. 58 #37 - 94',
      totalSpots: 75,
    },
    { id: 2, name: 'Test 2', address: 'Cl. 58 #37 - 94', totalSpots: 50 },
    { id: 3, name: 'Test 3', address: 'Cl. 58 #37 - 94', totalSpots: 25 },
  ]);

  const handleAddPlace = (newPlace) => {
    setParkingPlaces([...parkingPlaces, { ...newPlace, id: Date.now() }]);
  };

  const handleEditPlace = (editingPlace) => {
    setParkingPlaces(
      parkingPlaces.map((place) =>
        place.id === editingPlace.id ? editingPlace : place,
      ),
    );
  };

  const handleDeletePlace = (id) => {
    setParkingPlaces(parkingPlaces.filter((place) => place.id !== id));
  };

  const handleAvailableSpotsChange = (id, change) => {
    setParkingPlaces(
      parkingPlaces.map((place) => {
        if (place.id === id) {
          const newAvailableSpots = Math.max(
            0,
            Math.min(place.totalSpots, place.availableSpots + change),
          );
          return { ...place, availableSpots: newAvailableSpots };
        }
        return place;
      }),
    );
  };

  const handleAvailableSpotsInput = (id, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setParkingPlaces(
        parkingPlaces.map((place) => {
          if (place.id === id) {
            const newAvailableSpots = Math.max(
              0,
              Math.min(place.totalSpots, numValue),
            );
            return { ...place, availableSpots: newAvailableSpots };
          }
          return place;
        }),
      );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col">
      <header
        className={getHeaderclassName({
          className: 'gap-6 bg-white sticky md:relative top-0 z-10',
        })}
      >
        <Link to="/">
          <Logo variant="secondary" />
        </Link>
      </header>
      <main className="self-center gap-4 p-4 mt-1 max-w-4xl w-full">
        <section className="p-8 bg-white rounded-xl shadow-sm overflow-hidden space-y-6 min-w-96">
          <div className="flex w-full justify-between items-center">
            <h1 className="text-2xl">Tus Parqueaderos</h1>
            <ParkingFormDialog
              title="Añadir un nuevo parqueadero"
              description="Ingresa los datos del nuevo parqueadero para añadirlo a tu lista."
              onSubmit={handleAddPlace}
            >
              <Button className="bg-blue-500 hover:bg-blue-600">
                <LuPlus className="mr-2 h-4 w-4" /> Añadir Nuevo Parqueadero
              </Button>
            </ParkingFormDialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingPlaces.map((place) => (
              <Card
                key={place.id}
                variant="inherit"
                className="overflow-hidden"
              >
                <CardHeader className="bg-gray-50">
                  <h3 className="font-medium">{place.name}</h3>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-0 pb-2 border-b">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-600">Dirección</span>
                      <span className="text-sm">{place.address}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-600">
                        Total de Espacios
                      </span>
                      <span className="text-sm font-medium">
                        {place.totalSpots}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col mb-4 gap-1 pt-4">
                    <Label
                      className="text-sm text-gray-600"
                      htmlFor={`${place.id}_availableSpots`}
                    >
                      Disponibles Ahora
                    </Label>
                    <div className="flex items-center space-x-2 w-full">
                      <Button
                        size="icon"
                        onClick={() => handleAvailableSpotsChange(place.id, -1)}
                        disabled={place.availableSpots <= 0}
                      >
                        <LuMinus className="h-4 w-4" />
                      </Button>
                      <Input
                        id={`${place.id}_availableSpots`}
                        type="number"
                        value={place.availableSpots}
                        onChange={(e) =>
                          handleAvailableSpotsInput(place.id, e.target.value)
                        }
                        className="w-16 text-center flex-1"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleAvailableSpotsChange(place.id, 1)}
                        disabled={place.availableSpots >= place.totalSpots}
                      >
                        <LuPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-between w-full p-4">
                  <ParkingFormDialog
                    title="Editar Parqueadero"
                    description="Actualiza la información de tu parqueadero aquí."
                    onSubmit={handleEditPlace}
                    initialValues={place}
                  >
                    <Button variant="outline" size="sm">
                      <LuPencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                  </ParkingFormDialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePlace(place.id)}
                    className="text-red-500 p-0"
                  >
                    <LuTrash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
