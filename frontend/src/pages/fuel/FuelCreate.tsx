import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as fuelService from '../../services/fuel.service';
import { useVehicles } from '../../hooks/useVehicles';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { FUEL_TYPES } from '../../types/vehicle';
import { toDateInputValue } from '../../utils/formatDate';

const schema = z.object({
  vehicleId: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'OTHER']),
  quantity: z.coerce.number().positive('Must be positive'),
  pricePerUnit: z.coerce.number().min(0),
  odometer: z.coerce.number().min(0),
  station: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function FuelCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: vehiclesData } = useVehicles({ limit: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: toDateInputValue(new Date()),
      fuelType: 'DIESEL',
      quantity: 0,
      pricePerUnit: 0,
      odometer: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: fuelService.createFuel,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fuel'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        station: values.station || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Fuel record created');
      navigate('/fuel');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add Fuel Record" description="Log a fuel purchase" />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Vehicle"
            placeholder="Select vehicle"
            options={(vehiclesData?.data ?? []).map((v) => ({
              label: `${v.registrationNumber} — ${v.make} ${v.model}`,
              value: v._id,
            }))}
            error={errors.vehicleId?.message}
            {...register('vehicleId')}
          />
          <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
          <Select
            label="Fuel Type"
            options={FUEL_TYPES.map((f) => ({ label: f, value: f }))}
            error={errors.fuelType?.message}
            {...register('fuelType')}
          />
          <Input
            label="Quantity"
            type="number"
            step="0.01"
            error={errors.quantity?.message}
            {...register('quantity')}
          />
          <Input
            label="Price Per Unit"
            type="number"
            step="0.01"
            error={errors.pricePerUnit?.message}
            {...register('pricePerUnit')}
          />
          <Input
            label="Odometer"
            type="number"
            error={errors.odometer?.message}
            {...register('odometer')}
          />
          <Input label="Station" {...register('station')} />
          <Input label="Notes" {...register('notes')} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/fuel')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
