import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { forwardRef, useImperativeHandle } from 'react';

import { itemVariants } from '@/components/admin/Onboarding';
import { Label } from '@/components/common/Label';
import { Input } from '@/components/common/Input';

const FirstStep = forwardRef(
  ({ user = { email: 'pedro@parkiu.com' }, onComplete }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: {
        email: user.email,
        fullName: '',
        id: '',
      },
    });

    const onSubmit = async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // to fake the fucking API call that camilo wasn't able to send me
      // TODO: HANDKLE form
      if (typeof onComplete === 'function') onComplete(data);
    };

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        await handleSubmit(onSubmit)();
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
              disabled
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label htmlFor="fullName" className="text-blue-100">
              Nombre Completo
            </Label>
            <Input
              id="fullName"
              {...register('fullName', { required: 'Full name is required' })}
              placeholder="Ingresa tu nombre completo"
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm mt-1">
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
              {...register('id', { required: 'Id name is required' })}
              placeholder="Ingresa tu cédula o NIT"
            />
            {errors.id && (
              <p className="text-red-400 text-sm mt-1">{errors.id.message}</p>
            )}
          </motion.div>
        </form>
      </div>
    );
  },
);

FirstStep.displayName = 'FirstStep';

export { FirstStep };
