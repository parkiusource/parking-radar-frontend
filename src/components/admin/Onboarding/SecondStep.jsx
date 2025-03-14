import { forwardRef, useState } from 'react';

import { ParkingForm } from '@/components/admin/ParkingForm';
import { Card } from '@/components/common';
import { CardContent } from '@/components/common/Card';
import { useCreateParking } from '@/api/hooks/useCreateParking';

const SecondStep = forwardRef(({ onComplete }, ref) => {
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const { createParking } = useCreateParking({
    onSuccess: (data) => {
      setStatus({
        loading: false,
        error: null,
        success: true
      });
      // Avanzar al siguiente paso después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        if (typeof onComplete === 'function') onComplete(data);
      }, 1500);
    },
  });

  const onSubmit = async (data) => {
    try {
      setStatus({
        loading: true,
        error: null,
        success: false
      });

      await createParking(data);
      // No llamamos a onComplete aquí - lo manejamos en onSuccess del hook
    } catch (error) {
      console.error('Error al crear el parqueadero:', error);
      setStatus({
        loading: false,
        error: error?.message || 'Error al crear el parqueadero. Intenta nuevamente.',
        success: false
      });
    }
  };

  return (
    <div className="p-4">
      <Card className="overflow-hidden bg-white">
        <CardContent className="pt-6">
          {status.error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
              <h3 className="font-medium">Error</h3>
              <p className="text-sm mt-1">{status.error}</p>
            </div>
          )}

          {status.success && (
            <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
              <h3 className="font-medium">¡Éxito!</h3>
              <p className="text-sm mt-1">El parqueadero ha sido creado correctamente.</p>
            </div>
          )}

          <ParkingForm
            inheritSubmit={false}
            ref={ref}
            onSubmit={onSubmit}
            isLoading={status.loading}
          />
        </CardContent>
      </Card>
    </div>
  );
});

SecondStep.displayName = 'SecondStep';

export { SecondStep };
