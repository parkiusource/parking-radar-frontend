import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { forwardRef, useImperativeHandle } from 'react';

import { itemVariants } from '@/components/admin/Onboarding';
import { Label } from '@/components/common/Label';
import { Input } from '@/components/common/Input';

const FirstStep = forwardRef(({ user = { email: '' }, onComplete }, ref) => {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      email: user.email,
      fullName: '',
      id: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onTouched',
  });

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // TODO: HANDKLE form
    if (typeof onComplete === 'function') onComplete(data);
  };

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      if (isValid) return await handleSubmit(onSubmit)();

      trigger();
      return Promise.reject();
    },
  }));

  return (
    <div className="px-2 py-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-blue-100">
            Correo Electrónico
          </Label>
          <Input
            id="email"
            {...register('email', { required: 'Email es requerido' })}
            placeholder="Ingresa tu correo electrónico"
            disabled={user.email}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
          )}
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <Label htmlFor="fullName" className="text-blue-100">
            Nombre Completo
          </Label>
          <Input
            id="fullName"
            {...register('fullName', {
              required: 'Necesitamos tu nombre para continuar',
              validate: (value) => {
                if ((value ?? '').trim().split(' ').length <= 1) {
                  console.log('invalid', value);
                  return 'Parece que no has usado tu nombre completo';
                }
              },
            })}
            placeholder="Ingresa tu nombre completo"
          />
          {errors.fullName && (
            <p className="text-red-400 text-xs pl-4">
              {errors.fullName.message}
            </p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <Label htmlFor="id" className="text-blue-100">
            Cédula o NIT
          </Label>
          <Input
            id="id"
            type="number"
            {...register('id', {
              required: 'Tu identificación es requerida',
              valueAsNumber: true,
              validate: (value) => {
                return value > 0 || 'Ingresa una identificación válida';
              },
            })}
            placeholder="Ingresa tu cédula o NIT"
          />
          {errors.id && (
            <p className="text-red-400 text-xs pl-4">{errors.id.message}</p>
          )}
        </motion.div>
      </form>
    </div>
  );
});

FirstStep.displayName = 'FirstStep';

export { FirstStep };
