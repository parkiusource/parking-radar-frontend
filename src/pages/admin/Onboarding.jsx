import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { motion } from 'framer-motion';
import { Button } from '@/components/common';
import { FirstStep, itemVariants } from '@/components/admin/Onboarding';

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

const steps = [
  {
    title: 'Información Básica',
    description: 'Cuéntanos un poco sobre tu negocio',
    buttonLabel: 'Empezar',
  },
  {
    title: 'Preferences',
    description: 'Customize your experience',
    buttonLabel: 'Guardar y Continuar',
  },
  {
    title: 'Finish',
    description: 'Review and complete',
    buttonLabel: 'Finalizar',
  },
];

export default function AdminOnboarding() {
  const { loginWithLocale, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState(0);
  const firstStepRef = useRef();
  const currentStep = useMemo(() => steps[step], [step]);
  const [loading, setLoading] = useState(false);

  const nextStep = useCallback(async () => {
    switch (step) {
      case 1:
        if (firstStepRef?.current) {
          setLoading(true);
          await firstStepRef.current.submitForm();
          setLoading(false);
        }
        break;
      default:
        break;
    }

    setStep(step + 1);
  }, [step]);

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
            <div className="flex flex-col">
              <div className="w-full flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary' : 'bg-primary/20'} text-white font-bold`}
                >
                  1
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-primary-100">
                    Información Básica
                  </h2>
                  <p className="text-primary-200 text-sm">
                    Cuéntanos un poco sobre tu negocio
                  </p>
                </div>
              </div>
              {step === 1 && <FirstStep ref={firstStepRef} />}
            </div>
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-primary-100">
                  Parqueadero
                </h2>
                <p className="text-primary-200 text-sm">
                  Registra tu primer parqueadero
                </p>
              </div>
            </div>
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-primary-100">
                  Finalizar
                </h2>
                <p className="text-primary-200 text-sm">
                  Revisa nuestras recomendaciones y finaliza
                </p>
              </div>
            </div>
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
