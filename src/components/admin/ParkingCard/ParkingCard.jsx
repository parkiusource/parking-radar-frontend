import PropTypes from 'prop-types';
import { LuMinus, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

import { ParkingFormDialog } from '@/components/admin/ParkingForm';
import { Button } from '@/components/common/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';

export const ParkingCard = ({ parking }) => {
  return (
    <Card variant="inherit" className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <h3 className="font-medium text-nowrap text-ellipsis w-full overflow-hidden">
          {parking.name}
        </h3>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-0 pb-2 border-b">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-600">Dirección</span>
            <span className="text-sm">{parking.address}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-600">Total de Espacios</span>
            <span className="text-sm font-medium">{parking.totalSpots}</span>
          </div>
        </div>
        <div className="flex flex-col mb-4 gap-1 pt-4">
          <Label
            className="text-sm text-gray-600"
            htmlFor={`parking_${parking.id}_availableSpots`}
          >
            Disponibles Ahora
          </Label>
          <div className="flex items-center space-x-2 w-full">
            <Button
              size="icon"
              onClick={() => {}}
              disabled={parking.availableSpots <= 0}
            >
              <LuMinus className="h-4 w-4" />
            </Button>
            <Input
              id={`parking_${parking.id}_availableSpots`}
              type="number"
              value={parking.availableSpots}
              onChange={() => {}}
              className="w-16 text-center flex-1"
            />
            <Button
              size="icon"
              onClick={() => {}}
              disabled={parking.availableSpots >= parking.totalSpots}
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
          onSubmit={() => {}}
          initialValues={parking}
        >
          <Button variant="outline" size="sm">
            <LuPencil className="mr-2 h-4 w-4" /> Editar
          </Button>
        </ParkingFormDialog>
        <Button
          disabled
          variant="ghost"
          size="icon"
          className="text-red-500 p-0"
        >
          <LuTrash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

ParkingCard.displayName = 'ParkingCard';

ParkingCard.propTypes = {
  parking: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    totalSpots: PropTypes.number.isRequired,
    availableSpots: PropTypes.number.isRequired,
  }).isRequired,
};

export default ParkingCard;
