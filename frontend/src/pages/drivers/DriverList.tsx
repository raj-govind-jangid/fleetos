import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useDeleteDriver, useDrivers } from '../../hooks/useDrivers';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DRIVER_STATUSES } from '../../types/driver';
import { formatDate } from '../../utils/formatDate';

export default function DriverList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = useMemo(
    () => ({ page, limit: 10, search: search || undefined, status: status || undefined }),
    [page, search, status]
  );

  const { data, isLoading, isError, error, refetch } = useDrivers(params);
  const deleteMutation = useDeleteDriver();

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Driver deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Manage drivers and license information"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/drivers/new')}>
            Add Driver
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="flex w-full gap-2 sm:w-80 sm:shrink-0"
        >
          <Input
            placeholder="Search name, employee ID, license..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            wrapperClassName="min-w-0 flex-1"
          />
          <Button type="submit" variant="outline" className="shrink-0" leftIcon={<Search className="h-4 w-4" />}>
            Search
          </Button>
        </form>
        <Select
          options={DRIVER_STATUSES.map((s) => ({ label: s, value: s }))}
          placeholder="All statuses"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:w-44 sm:shrink-0"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          title="No drivers found"
          actionLabel="Add Driver"
          onAction={() => navigate('/drivers/new')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Employee ID</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">License</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Expiry</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((driver) => (
                  <tr key={driver._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link
                        to={`/drivers/${driver._id}`}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        {driver.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{driver.employeeId}</td>
                    <td className="px-4 py-3 text-slate-600">{driver.phone}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {driver.licenseNumber} ({driver.licenseType})
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(driver.licenseExpiryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(driver.status)}>{driver.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/drivers/${driver._id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(driver._id)}
                          leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                        />
                      </div>
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
        message="Delete this driver permanently?"
        loading={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
