import { useState } from 'react';
import PropTypes from 'prop-types';
import { DialogTitle } from '@radix-ui/react-dialog';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '@/components/common/Dialog';

import { ParkingForm } from './ParkingForm';

const wait = () => new Promise((resolve) => setTimeout(resolve, 0));

export const ParkingFormDialog = ({
  children,
  onSubmit,
  title,
  description,
  initialValues,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ParkingForm
          initialValues={initialValues}
          onSubmit={async (place) => {
            onSubmit(place);
            await wait();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

ParkingFormDialog.displayName = 'ParkingFormDialog';

ParkingFormDialog.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default ParkingFormDialog;
