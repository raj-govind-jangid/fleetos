import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDriver, useDriver, useUpdateDriver } from '../../hooks/useDrivers';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { DRIVER_STATUSES } from '../../types/driver';
import { toDateInputValue } from '../../utils/formatDate';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  email: z.string().email().optional().or(z.literal('')),
  employeeId: z.string().min(1, 'Required'),
  licenseNumber: z.string().min(1, 'Required'),
  licenseType: z.string().min(1, 'Required'),
  licenseExpiryDate: z.string().min(1, 'Required'),
  dateOfJoining: z.string().min(1, 'Required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']),
});

type FormValues = z.infer<typeof schema>;

export default function DriverForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { data: details, isLoading, isError, error, refetch } = useDriver(id);
  const driver = details?.driver;
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'ACTIVE',
      licenseType: 'LMV',
      dateOfJoining: toDateInputValue(new Date()),
    },
  });

  useEffect(() => {
    if (driver) {
      reset({
        name: driver.name,
        phone: driver.phone,
        email: driver.email ?? '',
        employeeId: driver.employeeId,
        licenseNumber: driver.licenseNumber,
        licenseType: driver.licenseType,
        licenseExpiryDate: toDateInputValue(driver.licenseExpiryDate),
        dateOfJoining: toDateInputValue(driver.dateOfJoining),
        status: driver.status,
      });
    }
  }, [driver, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      email: values.email || undefined,
    };
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, payload });
        toast.success('Driver updated');
        navigate(`/drivers/${id}`);
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast.success('Driver created');
        navigate(`/drivers/${created._id}`);
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
        title={isEdit ? 'Edit Driver' : 'Add Driver'}
        description={isEdit ? 'Update driver profile' : 'Register a new driver'}
      />

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name" error={errors.name?.message} {...register('name')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Employee ID"
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />
          <Input
            label="License Number"
            error={errors.licenseNumber?.message}
            {...register('licenseNumber')}
          />
          <Input
            label="License Type"
            error={errors.licenseType?.message}
            {...register('licenseType')}
          />
          <Input
            label="License Expiry"
            type="date"
            error={errors.licenseExpiryDate?.message}
            {...register('licenseExpiryDate')}
          />
          <Input
            label="Date of Joining"
            type="date"
            error={errors.dateOfJoining?.message}
            {...register('dateOfJoining')}
          />
          <Select
            label="Status"
            options={DRIVER_STATUSES.map((s) => ({ label: s, value: s }))}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Driver'}
          </Button>
        </div>
      </form>
    </div>
  );
}
