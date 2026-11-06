import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PageLoader } from '../../components/common/LoadingSpinner';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'viewer@fleetos.com',
      password: 'Viewer@123',
    },
  });

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(15, 76, 129, 0.18), transparent), linear-gradient(180deg, #eef5fb 0%, #f4f6f9 45%, #f4f6f9 100%)',
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-xl font-bold text-white shadow-sm">
            F
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">FleetOS</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your fleet operations</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="mt-6 w-full" loading={isSubmitting}>
            Sign in
          </Button>

          <div className="mt-4 text-center text-xs text-slate-400">
            <p>View only: viewer@fleetos.com / Viewer@123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
