import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as authService from '../../services/auth.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PageLoader } from '../../components/common/LoadingSpinner';

const profileSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Valid email is required'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'Min 6 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Must be different from current password',
    path: ['newPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const toast = useToast();
  const { user, refreshUser, isLoading } = useAuth();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  if (isLoading || !user) return <PageLoader />;

  const onProfileSubmit = handleProfileSubmit(async (values) => {
    try {
      await authService.updateProfile(values);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  const onPasswordSubmit = handlePasswordSubmit(async (values) => {
    try {
      await authService.changePassword(values);
      resetPassword();
      toast.success('Password changed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="My Profile" description="Manage your account details and password" />

      <form
        onSubmit={onProfileSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900">Profile details</h2>
          <p className="mt-1 text-sm text-slate-500">Update your name and email address</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            error={profileErrors.name?.message}
            {...registerProfile('name')}
          />
          <Input
            label="Email"
            type="email"
            error={profileErrors.email?.message}
            {...registerProfile('email')}
          />
          <Input label="Role" value={user.role.replaceAll('_', ' ')} disabled />
          {user.status && <Input label="Status" value={user.status} disabled />}
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={profileSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>

      <form
        onSubmit={onPasswordSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900">Change password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a strong password you don&apos;t use elsewhere
          </p>
        </div>
        <div className="grid gap-4">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={passwordSubmitting}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
