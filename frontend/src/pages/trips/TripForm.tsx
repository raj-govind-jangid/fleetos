import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTrip, useTrip, useUpdateTrip } from '../../hooks/useTrips';
import { useVehicles } from '../../hooks/useVehicles';
import { useDrivers } from '../../hooks/useDrivers';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { TRIP_STATUSES } from '../../types/trip';
import { toDateInputValue } from '../../utils/formatDate';

const schema = z.object({
  vehicleId: z.string().min(1, 'Required'),
  driverId: z.string().min(1, 'Required'),
  source: z.string().min(1, 'Required'),
  destination: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  expectedEndDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  startOdometer: z.coerce.number().min(0),
  endOdometer: z.coerce.number().min(0).optional().or(z.literal('')),
  status: z.enum(['PLANNED', 'ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function TripForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { data: trip, isLoading, isError, error, refetch } = useTrip(id);
  const { data: vehiclesData } = useVehicles({ limit: 100 });
  const { data: driversData } = useDrivers({ limit: 100, status: 'ACTIVE' });
  const createMutation = useCreateTrip();
  const updateMutation = useUpdateTrip();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'PLANNED',
      startDate: toDateInputValue(new Date()),
      startOdometer: 0,
    },
  });

  useEffect(() => {
    if (trip) {
      const vehicleId = typeof trip.vehicleId === 'object' ? trip.vehicleId._id : trip.vehicleId;
      const driverId = typeof trip.driverId === 'object' ? trip.driverId._id : trip.driverId;
      reset({
        vehicleId,
        driverId,
        source: trip.source,
        destination: trip.destination,
        startDate: toDateInputValue(trip.startDate),
        expectedEndDate: toDateInputValue(trip.expectedEndDate),
        actualEndDate: toDateInputValue(trip.actualEndDate),
        startOdometer: trip.startOdometer,
        endOdometer: trip.endOdometer ?? '',
        status: trip.status,
        notes: trip.notes ?? '',
      });
    }
  }, [trip, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      vehicleId: values.vehicleId,
      driverId: values.driverId,
      source: values.source,
      destination: values.destination,
      startDate: values.startDate,
      expectedEndDate: values.expectedEndDate || undefined,
      startOdometer: values.startOdometer,
      status: values.status,
      notes: values.notes || undefined,
      ...(isEdit
        ? {
            actualEndDate: values.actualEndDate || undefined,
            endOdometer:
              values.endOdometer === '' || values.endOdometer === undefined
                ? undefined
                : Number(values.endOdometer),
          }
        : {}),
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, payload });
        toast.success('Trip updated');
        navigate(`/trips/${id}`);
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast.success('Trip created');
        navigate(`/trips/${created._id}`);
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
        title={isEdit ? 'Edit Trip' : 'New Trip'}
        description={isEdit ? 'Update trip details' : 'Schedule a new trip'}
      />

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
            label="Driver"
            placeholder="Select driver"
            options={(driversData?.data ?? []).map((d) => ({
              label: `${d.name} (${d.employeeId})`,
              value: d._id,
            }))}
            error={errors.driverId?.message}
            {...register('driverId')}
          />
          <Input label="Source" error={errors.source?.message} {...register('source')} />
          <Input
            label="Destination"
            error={errors.destination?.message}
            {...register('destination')}
          />
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input label="Expected End Date" type="date" {...register('expectedEndDate')} />
          {isEdit && <Input label="Actual End Date" type="date" {...register('actualEndDate')} />}
          <Input
            label="Start Odometer"
            type="number"
            error={errors.startOdometer?.message}
            {...register('startOdometer')}
          />
          {isEdit && (
            <Input label="End Odometer" type="number" {...register('endOdometer')} />
          )}
          <Select
            label="Status"
            options={TRIP_STATUSES.map((s) => ({ label: s, value: s }))}
            error={errors.status?.message}
            {...register('status')}
          />
          <div className="sm:col-span-2">
            <Input label="Notes" {...register('notes')} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Trip'}
          </Button>
        </div>
      </form>
    </div>
  );
}
