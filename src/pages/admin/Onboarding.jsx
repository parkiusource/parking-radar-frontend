import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { motion } from 'framer-motion';
import { Button } from '@/components/common';
import { FirstStep, itemVariants } from '@/components/admin/Onboarding';
import { twMerge } from 'tailwind-merge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.2,
    },
  },
};

export default function AdminOnboarding() {
  const { loginWithLocale, isAuthenticated, isLoading } = useAuth();

  const firstStepRef = useRef();

  const steps = useMemo(() => {
    return [
      {
        id: 0,
        buttonLabel: 'Comenzar',
      },
      {
        id: 1,
        title: 'Información Básica',
        description: 'Cuéntanos un poco sobre tu negocio',
        buttonLabel: 'Guardar y Continuar',
        ref: firstStepRef,
        StepComponent: FirstStep,
        beforeNext: async () => {
          if (firstStepRef?.current) {
            await firstStepRef.current.submitForm();
          }
        },
      },
      {
        id: 2,
        title: 'Parqueadero',
        description: 'Registra tu primer parqueadero',
        buttonLabel: 'Guardar y Continuar',
      },
      {
        id: 3,
        title: 'Finalizar',
        description: 'Revisa nuestras recomendaciones y finaliza',
        buttonLabel: 'Finalizar',
      },
    ];
  }, [firstStepRef]);

  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(0);
  const currentStep = useMemo(
    () => steps.find((s) => s.id === step),
    [steps, step],
  );

  console.log({ step, currentStep });

  const nextStep = useCallback(async () => {
    if (currentStep.beforeNext) {
      setLoading(true);
      await currentStep.beforeNext();
      setLoading(false);
    }
    setStep(currentStep.id + 1);
  }, [currentStep]);

  if (isLoading) {
    return <></>;
  } else if (!isAuthenticated) {
    loginWithLocale();
    return <></>;
  }

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col bg-gradient-to-br from-primary-100 to-primary-50">
      <header
        className={getHeaderClassName({
          className: 'gap-6 bg-white sticky md:relative top-0 z-10',
        })}
      >
        <Logo variant="secondary" />
      </header>
      <main className="self-center gap-4 p-4 mt-1 w-full h-full flex justify-center items-center">
        <motion.div
          className="bg-secondary bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-lg shadow-neutral-500/50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-3xl font-bold text-primary-50 mb-6"
            variants={itemVariants}
          >
            Bienvenido a Parkiu!
          </motion.h1>
          <motion.p className="text-primary-100 mb-8" variants={itemVariants}>
            Vamos a configurar tu cuenta en solo unos pasos.
          </motion.p>
          <motion.div className="space-y-4" variants={itemVariants}>
            {steps
              .slice(1)
              .map(({ id, title, description, ref, StepComponent }) => (
                <div className="flex flex-col" key={`step_${id}`}>
                  <div className="w-full flex items-center">
                    <div
                      className={twMerge(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
                        step >= id ? 'bg-primary' : 'bg-primary/20',
                      )}
                    >
                      {id}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-primary-100">
                        {title}
                      </h2>
                      <p className="text-primary-200 text-sm">{description}</p>
                    </div>
                  </div>
                  {currentStep.id === id && StepComponent && (
                    <StepComponent ref={ref} setLoading={setLoading} />
                  )}
                </div>
              ))}
          </motion.div>
          <motion.div
            className="mt-8 w-full flex justify-center items-center py-3 px-4 transition duration-300 ease-in-out"
            variants={itemVariants}
          >
            <Button className="min-w-60" onClick={nextStep} disabled={loading}>
              {currentStep.buttonLabel}
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
