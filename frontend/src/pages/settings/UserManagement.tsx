import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import * as orgService from '../../services/organization.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { UserStatus } from '../../types/auth';
import { formatDate } from '../../utils/formatDate';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  password: z.string().min(6, 'Min 6 characters'),
  role: z.enum(['ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT', 'DRIVER', 'VIEWER', 'READ_ONLY']),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Fleet Manager', value: 'FLEET_MANAGER' },
  { label: 'Accountant', value: 'ACCOUNTANT' },
  { label: 'Driver', value: 'DRIVER' },
  { label: 'Viewer', value: 'VIEWER' },
  { label: 'Read Only', value: 'READ_ONLY' },
];

export default function UserManagement() {
  const toast = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['organization-users'],
    queryFn: orgService.listUsers,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'READ_ONLY' },
  });

  const createMutation = useMutation({
    mutationFn: orgService.createUser,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['organization-users'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      orgService.updateUserStatus(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['organization-users'] }),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('User created');
      setOpen(false);
      reset({ role: 'VIEWER', name: '', email: '', password: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  const toggleStatus = async (id: string, current: UserStatus) => {
    const next: UserStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await statusMutation.mutateAsync({ id, status: next });
      toast.success(`User marked ${next}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage organization users and access"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            Add User
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No users" actionLabel="Add User" onAction={() => setOpen(true)} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.role.replaceAll('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(user.status)}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        loading={statusMutation.isPending}
                        onClick={() => void toggleStatus(user._id, user.status)}
                      >
                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add User"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={isSubmitting} onClick={() => void onSubmit()}>
              Create
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            {...register('role')}
          />
        </form>
      </Modal>
    </div>
  );
}
