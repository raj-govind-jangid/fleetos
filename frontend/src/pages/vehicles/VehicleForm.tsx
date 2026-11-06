import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '../../hooks/useVehicles';
import { useDrivers } from '../../hooks/useDrivers';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { FUEL_TYPES, VEHICLE_STATUSES, VEHICLE_TYPES } from '../../types/vehicle';

const schema = z.object({
  registrationNumber: z.string().min(1, 'Required'),
  make: z.string().min(1, 'Required'),
  model: z.string().min(1, 'Required'),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  vehicleType: z.enum(['CAR', 'SUV', 'TRUCK', 'BUS', 'VAN', 'BIKE', 'OTHER']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'OTHER']),
  color: z.string().optional(),
  vin: z.string().optional(),
  engineNumber: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SOLD']),
  currentOdometer: z.coerce.number().min(0),
  assignedDriverId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function VehicleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { data: vehicle, isLoading, isError, error, refetch } = useVehicle(id);
  const { data: driversData } = useDrivers({ limit: 100, status: 'ACTIVE' });
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'ACTIVE',
      currentOdometer: 0,
      vehicleType: 'CAR',
      fuelType: 'DIESEL',
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (vehicle) {
      const driverId =
        vehicle.assignedDriverId && typeof vehicle.assignedDriverId === 'object'
          ? vehicle.assignedDriverId._id
          : (vehicle.assignedDriverId ?? '');
      reset({
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vehicleType: vehicle.vehicleType,
        fuelType: vehicle.fuelType,
        color: vehicle.color ?? '',
        vin: vehicle.vin ?? '',
        engineNumber: vehicle.engineNumber ?? '',
        status: vehicle.status,
        currentOdometer: vehicle.currentOdometer,
        assignedDriverId: driverId || '',
      });
    }
  }, [vehicle, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      assignedDriverId: values.assignedDriverId || null,
      color: values.color || undefined,
      vin: values.vin || undefined,
      engineNumber: values.engineNumber || undefined,
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, payload });
        toast.success('Vehicle updated');
        navigate(`/vehicles/${id}`);
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast.success('Vehicle created');
        navigate(`/vehicles/${created._id}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  if (isEdit && isLoading) return <PageLoader />;
  if (isEdit && isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
        description={isEdit ? 'Update vehicle details' : 'Register a new vehicle in your fleet'}
      />

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Registration Number"
            error={errors.registrationNumber?.message}
            {...register('registrationNumber')}
          />
          <Input label="Make" error={errors.make?.message} {...register('make')} />
          <Input label="Model" error={errors.model?.message} {...register('model')} />
          <Input
            label="Year"
            type="number"
            error={errors.year?.message}
            {...register('year')}
          />
          <Select
            label="Vehicle Type"
            options={VEHICLE_TYPES.map((v) => ({ label: v, value: v }))}
            error={errors.vehicleType?.message}
            {...register('vehicleType')}
          />
          <Select
            label="Fuel Type"
            options={FUEL_TYPES.map((v) => ({ label: v, value: v }))}
            error={errors.fuelType?.message}
            {...register('fuelType')}
          />
          <Input label="Color" {...register('color')} />
          <Input label="VIN" {...register('vin')} />
          <Input label="Engine Number" {...register('engineNumber')} />
          <Select
            label="Status"
            options={VEHICLE_STATUSES.map((v) => ({ label: v, value: v }))}
            error={errors.status?.message}
            {...register('status')}
          />
          <Input
            label="Current Odometer (km)"
            type="number"
            error={errors.currentOdometer?.message}
            {...register('currentOdometer')}
          />
          <Select
            label="Assigned Driver"
            placeholder="Unassigned"
            options={(driversData?.data ?? []).map((d) => ({
              label: `${d.name} (${d.employeeId})`,
              value: d._id,
            }))}
            {...register('assignedDriverId')}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
