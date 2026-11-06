import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as orgService from '../../services/organization.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OrganizationSettings() {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['organization'],
    queryFn: orgService.getOrganization,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        email: data.email,
        phone: data.phone ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        country: data.country ?? '',
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: orgService.updateOrganization,
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: ['organization'] });
      await refreshUser();
    },
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Organization updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Organization"
        description="Update your organization profile"
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Country" {...register('country')} />
          <div className="sm:col-span-2">
            <Input label="Address" {...register('address')} />
          </div>
          <Input label="City" {...register('city')} />
          <Input label="State" {...register('state')} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
