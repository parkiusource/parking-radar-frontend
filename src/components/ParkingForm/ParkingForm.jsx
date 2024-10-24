import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Button } from '@/components/common';

export const ParkingForm = ({ className, onSubmit, initialValues }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: '',
      address: '',
      totalSpots: null,
      ...initialValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={twMerge('grid gap-4 py-4', className)}
    >
      <div className="grid grid-cols-4 items-center gap-4 w-full">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Parqueadero de la 123"
          {...register('name')}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4 w-full">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          placeholder="Calle 123 # 45-67"
          {...register('address')}
          className="col-span-3"
        />
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <Label htmlFor="totalSpots">
          ¿Cuántos puestos tiene tu nuevo parqueadero?
        </Label>
        <Input
          id="totalSpots"
          type="number"
          placeholder="100"
          {...register('totalSpots', { valueAsNumber: true })}
          className="col-span-3"
        />
      </div>
      <div className="w-full flex justify-end mt-4">
        <Button type="submit" className="">
          {initialValues ? 'Guardar Cambios' : 'Añadir Parqueadero'}
        </Button>
      </div>
    </form>
  );
};

ParkingForm.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

ParkingForm.displayName = 'ParkingForm';
