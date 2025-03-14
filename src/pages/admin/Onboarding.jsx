import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/common';
import {
  FirstStep,
  itemVariants,
  SecondStep,
  ThirdStep,
} from '@/components/admin/Onboarding';
import { getHeaderClassName } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { LoadingOverlay } from '@/components/common';

import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminProfile, useUpdateOnboardingStep } from '@/api/hooks/useAdminOnboarding';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const firstStepRef = useRef();
  const secondStepRef = useRef();
  const redirectedRef = useRef(false);

  const {
    loginWithLocale,
    isAuthenticated,
    isLoading: userAuthLoading,
    user,
  } = useAuth();

  const { data: profile, isLoading: profileLoading } = useAdminProfile();
  const { mutateAsync: updateStep } = useUpdateOnboardingStep();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(() => {
    // Inicializar el step basado en el localStorage para evitar parpadeos
    const savedStep = localStorage.getItem('onboardingStep');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });

  // Efecto para manejar la redirección basada en el estado del perfil
  useEffect(() => {
    if (!profileLoading && profile && !redirectedRef.current) {
      // Si el perfil está completo y tenemos parqueaderos, redirigir al dashboard
      if (profile.isProfileComplete && profile.hasParking) {
        redirectedRef.current = true;
        localStorage.removeItem('onboardingStep');
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // Solo actualizar el step si es menor que el actual o si no hay step guardado
      const currentStep = parseInt(localStorage.getItem('onboardingStep'), 10) || 0;
      let newStep = currentStep;

      if (!profile.isProfileComplete && currentStep < 1) {
        newStep = 1; // Ir al paso de completar perfil
      } else if (profile.isProfileComplete && !profile.hasParking && currentStep < 2) {
        newStep = 2; // Ir al paso de crear parqueadero
      } else if (profile.isProfileComplete && profile.hasParking && currentStep < 3) {
        newStep = 3; // Ir al paso de verificación
      }

      if (newStep !== currentStep) {
        setStep(newStep);
        localStorage.setItem('onboardingStep', newStep.toString());
      }
    }
  }, [profile, profileLoading, navigate]);

  const steps = useMemo(() => {
    return [
      {
        id: 0,
        buttonLabel: 'Comenzar',
      },
      {
        id: 1,
        title: 'Información Básica',
        description: 'Completa tu perfil de administrador',
        buttonLabel: 'Guardar y Continuar',
        ref: firstStepRef,
        StepComponent: FirstStep,
        beforeNext: async () => {
          if (firstStepRef?.current) {
            const data = await firstStepRef.current.submitForm();
            await queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
            return data;
          }
        },
      },
      {
        id: 2,
        title: 'Parqueadero',
        description: 'Registra tu primer parqueadero',
        buttonLabel: 'Guardar y Continuar',
        ref: secondStepRef,
        StepComponent: SecondStep,
        beforeNext: async () => {
          if (secondStepRef?.current) {
            const data = await secondStepRef.current.submitForm();
            await queryClient.invalidateQueries({ queryKey: ['adminParkingLots'] });
            await queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
            return data;
          }
        },
      },
      {
        id: 3,
        title: 'Verificación',
        description: 'Verificaremos tu identidad para continuar',
        buttonLabel: 'Ir al Dashboard',
        StepComponent: ThirdStep,
        beforeNext: () => {
          localStorage.removeItem('onboardingStep'); // Limpiar el step al finalizar
          navigate('/admin/dashboard', { replace: true });
        },
      },
    ];
  }, [navigate, queryClient]);

  const currentStep = useMemo(
    () => steps.find((s) => s.id === step),
    [steps, step],
  );

  const nextStep = useCallback(async () => {
    if (currentStep.beforeNext) {
      setLoading(true);
      try {
        await currentStep.beforeNext();
        const nextStepNumber = currentStep.id + 1;
        setStep(nextStepNumber);
        localStorage.setItem('onboardingStep', nextStepNumber.toString());
        await updateStep(nextStepNumber);
      } catch (error) {
        console.error('Error in step:', error);
        return;
      } finally {
        setLoading(false);
      }
    } else {
      const nextStepNumber = currentStep.id + 1;
      setStep(nextStepNumber);
      localStorage.setItem('onboardingStep', nextStepNumber.toString());
      await updateStep(nextStepNumber);
    }
  }, [currentStep, updateStep]);

  // Mostrar loading mientras se verifica la autenticación o se carga el perfil
  if (userAuthLoading || profileLoading) {
    return <LoadingOverlay />;
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    loginWithLocale();
    return <LoadingOverlay />;
  }

  // Si el perfil está completo y tiene parqueaderos, no mostrar nada mientras se redirige
  if (profile?.isProfileComplete && profile?.hasParking) {
    return <LoadingOverlay />;
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
                        step > id ? 'bg-primary' : 'bg-primary/20',
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
                    <StepComponent
                      ref={ref}
                      setLoading={setLoading}
                      user={user}
                    />
                  )}
                </div>
              ))}
          </motion.div>
          {currentStep.buttonLabel && (
            <motion.div
              className="mt-8 w-full flex justify-center items-center py-3 px-4 transition duration-300 ease-in-out"
              variants={itemVariants}
            >
              <Button
                className="min-w-60"
                onClick={nextStep}
                disabled={loading}
              >
                {currentStep.buttonLabel}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
