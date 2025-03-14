import { forwardRef, useImperativeHandle } from 'react';

import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { LuNavigation, LuX } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

import { useSearchPlaces } from '@/api/hooks/useSearchPlaces';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Button } from '@/components/common';
import { SearchBox } from '@/components/SearchBox';

const MAX_ADDRESS_LENGTH = 40;

export const ParkingForm = forwardRef(
  ({ className, onSubmit, initialValues, inheritSubmit = true }, ref) => {
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      trigger,
      formState: { isValid },
    } = useForm({
      defaultValues: {
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        totalSpots: null,
        ...initialValues,
      },
    });

    const address = watch('address');

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        if (isValid) return await handleSubmit(onSubmit)();

        trigger();
        return Promise.reject();
      },
    }));

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
          <SearchBox
            className="col-span-3"
            placeholder="Calle 123 # 45-67"
            useSearchHook={useSearchPlaces}
            value={address}
            onResultSelected={({ formattedAddress, location }) => {
              const { latitude, longitude } = location;

              setValue(
                'address',
                formattedAddress.slice(0, MAX_ADDRESS_LENGTH),
              );
              setValue('latitude', latitude);
              setValue('longitude', longitude);
            }}
          >
            <LuNavigation className="text-xs absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
            {address && (
              <LuX
                className="text-xs absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4"
                onClick={() => {
                  setValue('address', '');
                  setValue('latitude', '');
                  setValue('longitude', '');
                }}
              />
            )}
          </SearchBox>
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
        {inheritSubmit && (
          <div className="w-full flex justify-end mt-4">
            <Button type="submit" className="">
              {initialValues ? 'Guardar Cambios' : 'Añadir Parqueadero'}
            </Button>
          </div>
        )}
      </form>
    );
  },
);

ParkingForm.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  initialValues: PropTypes.object,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  inheritSubmit: PropTypes.bool,
};

ParkingForm.displayName = 'ParkingForm';
