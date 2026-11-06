import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import * as maintenanceService from '../../services/maintenance.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Select } from '../../components/common/Select';
import { MAINTENANCE_STATUSES } from '../../types/operations';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

function vehicleLabel(vehicleId: unknown): string {
  if (!vehicleId) return '—';
  if (typeof vehicleId === 'object' && vehicleId !== null && 'registrationNumber' in vehicleId) {
    return String((vehicleId as { registrationNumber: string }).registrationNumber);
  }
  return String(vehicleId);
}

export default function MaintenanceList() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = useMemo(
    () => ({ page, limit: 10, status: status || undefined }),
    [page, status]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['maintenance', params],
    queryFn: () => maintenanceService.listMaintenance(params),
  });

  const deleteMutation = useMutation({
    mutationFn: maintenanceService.deleteMaintenance,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['maintenance'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Maintenance record deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Service history and upcoming maintenance"
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/maintenance/new')}
          >
            Add Record
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <Select
          options={MAINTENANCE_STATUSES.map((s) => ({ label: s, value: s }))}
          placeholder="All statuses"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:w-56"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          title="No maintenance records"
          actionLabel="Add Record"
          onAction={() => navigate('/maintenance/new')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Cost</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-700">{formatDate(record.serviceDate)}</td>
                    <td className="px-4 py-3 text-slate-700">{vehicleLabel(record.vehicleId)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{record.maintenanceType}</Badge>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                      {record.description}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(record.cost)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(record.status)}>{record.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(record._id)}
                        leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        message="Delete this maintenance record?"
        loading={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
