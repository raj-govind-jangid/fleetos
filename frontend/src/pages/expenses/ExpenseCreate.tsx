import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as expenseService from '../../services/expense.service';
import { useVehicles } from '../../hooks/useVehicles';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { EXPENSE_CATEGORIES } from '../../types/operations';
import { toDateInputValue } from '../../utils/formatDate';

const schema = z.object({
  vehicleId: z.string().optional(),
  category: z.enum([
    'FUEL',
    'MAINTENANCE',
    'INSURANCE',
    'TOLL',
    'PARKING',
    'TAX',
    'PERMIT',
    'OTHER',
  ]),
  amount: z.coerce.number().min(0),
  date: z.string().min(1, 'Required'),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ExpenseCreate() {
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
      category: 'OTHER',
      amount: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: expenseService.createExpense,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['expenses'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        vehicleId: values.vehicleId || null,
        description: values.description || undefined,
        referenceNumber: values.referenceNumber || undefined,
      });
      toast.success('Expense created');
      navigate('/expenses');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add Expense" description="Record an operational expense" />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            options={EXPENSE_CATEGORIES.map((c) => ({ label: c, value: c }))}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
          <Select
            label="Vehicle (optional)"
            placeholder="None"
            options={(vehiclesData?.data ?? []).map((v) => ({
              label: `${v.registrationNumber} — ${v.make} ${v.model}`,
              value: v._id,
            }))}
            {...register('vehicleId')}
          />
          <Input label="Description" {...register('description')} />
          <Input label="Reference Number" {...register('referenceNumber')} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/expenses')}>
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
