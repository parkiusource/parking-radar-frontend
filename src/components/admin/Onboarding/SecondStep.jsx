import { forwardRef } from 'react';

import { ParkingForm } from '@/components/admin/ParkingForm';
import { Card } from '@/components/common';
import { CardContent } from '@/components/common/Card';
import { useCreateParking } from '@/api/hooks/useCreateParking';

const SecondStep = forwardRef(({ onComplete }, ref) => {
  const { createParking, isPending: isLoading } = useCreateParking({
    onSuccess: () => {},
  });

  const onSubmit = async (data) => {
    createParking(data);
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (typeof onComplete === 'function') onComplete(data);
  };

  return (
    <div className="p-4">
      <Card className="overflow-hidden bg-white">
        <CardContent className="pt-6">
          <ParkingForm inheritSubmit={false} ref={ref} onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </div>
  );
});

SecondStep.displayName = 'SecondStep';

export { SecondStep };
