import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as maintenanceService from '../../services/maintenance.service';
import { useVehicles } from '../../hooks/useVehicles';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { MAINTENANCE_STATUSES, MAINTENANCE_TYPES } from '../../types/operations';
import { toDateInputValue } from '../../utils/formatDate';

const schema = z.object({
  vehicleId: z.string().min(1, 'Required'),
  maintenanceType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'SERVICE']),
  description: z.string().min(1, 'Required'),
  serviceDate: z.string().min(1, 'Required'),
  odometer: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  vendor: z.string().optional(),
  nextServiceDate: z.string().optional(),
  nextServiceOdometer: z.coerce.number().min(0).optional().or(z.literal('')),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});

type FormValues = z.infer<typeof schema>;

export default function MaintenanceCreate() {
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
      serviceDate: toDateInputValue(new Date()),
      maintenanceType: 'SERVICE',
      status: 'COMPLETED',
      odometer: 0,
      cost: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: maintenanceService.createMaintenance,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['maintenance'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        vendor: values.vendor || undefined,
        nextServiceDate: values.nextServiceDate || undefined,
        nextServiceOdometer:
          values.nextServiceOdometer === '' || values.nextServiceOdometer === undefined
            ? undefined
            : Number(values.nextServiceOdometer),
      });
      toast.success('Maintenance record created');
      navigate('/maintenance');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add Maintenance" description="Log a service or repair" />
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
          <Select
            label="Type"
            options={MAINTENANCE_TYPES.map((t) => ({ label: t, value: t }))}
            error={errors.maintenanceType?.message}
            {...register('maintenanceType')}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
          <Input
            label="Service Date"
            type="date"
            error={errors.serviceDate?.message}
            {...register('serviceDate')}
          />
          <Input
            label="Odometer"
            type="number"
            error={errors.odometer?.message}
            {...register('odometer')}
          />
          <Input
            label="Cost"
            type="number"
            step="0.01"
            error={errors.cost?.message}
            {...register('cost')}
          />
          <Input label="Vendor" {...register('vendor')} />
          <Input label="Next Service Date" type="date" {...register('nextServiceDate')} />
          <Input label="Next Service Odometer" type="number" {...register('nextServiceOdometer')} />
          <Select
            label="Status"
            options={MAINTENANCE_STATUSES.map((s) => ({ label: s, value: s }))}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/maintenance')}>
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
