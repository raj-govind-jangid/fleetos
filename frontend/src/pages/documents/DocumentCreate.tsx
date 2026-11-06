import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as documentService from '../../services/document.service';
import { useVehicles } from '../../hooks/useVehicles';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { DOCUMENT_TYPES } from '../../types/operations';
import { toDateInputValue } from '../../utils/formatDate';

const schema = z.object({
  vehicleId: z.string().min(1, 'Required'),
  documentType: z.enum(['RC', 'INSURANCE', 'PUC', 'PERMIT', 'FITNESS', 'TAX', 'OTHER']),
  documentNumber: z.string().min(1, 'Required'),
  issueDate: z.string().min(1, 'Required'),
  expiryDate: z.string().min(1, 'Required'),
  file: z.instanceof(File).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function DocumentCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: vehiclesData } = useVehicles({ limit: 100 });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documentType: 'RC',
      issueDate: toDateInputValue(new Date()),
      expiryDate: '',
      file: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: documentService.createDocument,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        file: values.file ?? null,
      });
      toast.success('Document created');
      navigate('/documents');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add Document" description="Upload a vehicle compliance document" />
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
            label="Document Type"
            options={DOCUMENT_TYPES.map((t) => ({ label: t, value: t }))}
            error={errors.documentType?.message}
            {...register('documentType')}
          />
          <Input
            label="Document Number"
            error={errors.documentNumber?.message}
            {...register('documentNumber')}
          />
          <Input
            label="Issue Date"
            type="date"
            error={errors.issueDate?.message}
            {...register('issueDate')}
          />
          <Input
            label="Expiry Date"
            type="date"
            error={errors.expiryDate?.message}
            {...register('expiryDate')}
          />
          <Controller
            name="file"
            control={control}
            render={({ field: { onChange, name, ref } }) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  File (optional)
                </label>
                <input
                  ref={ref}
                  name={name}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
              </div>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/documents')}>
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
