import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, ShieldCheck } from 'lucide-react';
import { CircleParking } from 'lucide-react';

import { Button } from '@/components/common';
import {
  FirstStep,
  itemVariants,
  SecondStep,
  ThirdStep,
} from '@/components/admin/Onboarding';
import { Logo } from '@/components/layout/Logo';
import { LoadingOverlay } from '@/components/common';

import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminProfile, useUpdateOnboardingStep } from '@/api/hooks/useAdminOnboarding';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: 'beforeChildren',
      staggerChildren: 0.2,
    },
  },
};

const stepIcons = {
  1: User,
  2: CircleParking,
  3: ShieldCheck,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white/70 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo variant="secondary" className="h-8" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Bienvenido a Parkiu
            </h1>
            <p className="text-gray-500 mb-12">
              Configura tu cuenta en unos sencillos pasos
            </p>
          </motion.div>

          <div className="mb-12">
            <div className="relative">
              <div className="absolute left-0 top-2 w-full h-0.5 bg-gray-100">
                <div
                  className="h-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {steps.slice(1).map(({ id, title }) => {
                  const StepIcon = stepIcons[id];
                  const isCompleted = step > id;
                  const isCurrent = step === id;

                  return (
                    <div key={id} className="flex flex-col items-center">
                      <div
                        className={twMerge(
                          'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                          isCompleted
                            ? 'bg-blue-400 border-blue-400 text-white'
                            : isCurrent
                            ? 'bg-white border-blue-400 text-blue-500 ring-4 ring-blue-50'
                            : 'bg-white border-gray-200 text-gray-400'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      <span
                        className={twMerge(
                          'mt-3 text-sm font-medium',
                          isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-400'
                        )}
                      >
                        {title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.div className="space-y-6" variants={itemVariants}>
            {currentStep.StepComponent && (
              <div className="bg-white rounded-xl p-8 border border-gray-100">
                <currentStep.StepComponent
                  ref={currentStep.ref}
                  setLoading={setLoading}
                  user={user}
                />
              </div>
            )}
          </motion.div>

          {currentStep.buttonLabel && (
            <motion.div
              className="mt-8 flex justify-end"
              variants={itemVariants}
            >
              <Button
                className="min-w-[200px] bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
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
