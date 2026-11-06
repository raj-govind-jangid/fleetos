import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useDeleteVehicle, useVehicles } from '../../hooks/useVehicles';
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
import { VEHICLE_STATUSES, VEHICLE_TYPES, type AssignedDriver } from '../../types/vehicle';
import { formatNumber } from '../../utils/formatCurrency';

export default function VehicleList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = useMemo(
    () => ({ page, limit: 10, search: search || undefined, status: status || undefined, vehicleType: vehicleType || undefined }),
    [page, search, status, vehicleType]
  );

  const { data, isLoading, isError, error, refetch } = useVehicles(params);
  const deleteMutation = useDeleteVehicle();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Vehicle deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Manage your fleet vehicles"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/vehicles/new')}>
            Add Vehicle
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex w-full gap-2 sm:w-80 sm:shrink-0">
          <Input
            placeholder="Search registration, make, model..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            wrapperClassName="min-w-0 flex-1"
          />
          <Button type="submit" variant="outline" className="shrink-0" leftIcon={<Search className="h-4 w-4" />}>
            Search
          </Button>
        </form>
        <Select
          options={VEHICLE_STATUSES.map((s) => ({ label: s, value: s }))}
          placeholder="All statuses"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:w-40 sm:shrink-0"
        />
        <Select
          options={VEHICLE_TYPES.map((s) => ({ label: s, value: s }))}
          placeholder="All types"
          value={vehicleType}
          onChange={(e) => {
            setVehicleType(e.target.value);
            setPage(1);
          }}
          className="sm:w-40 sm:shrink-0"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          title="No vehicles found"
          description="Add your first vehicle to start managing the fleet."
          actionLabel="Add Vehicle"
          onAction={() => navigate('/vehicles/new')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Registration</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Driver</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Odometer</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((vehicle) => {
                  const driver =
                    vehicle.assignedDriverId && typeof vehicle.assignedDriverId === 'object'
                      ? (vehicle.assignedDriverId as AssignedDriver)
                      : null;
                  return (
                    <tr key={vehicle._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <Link
                          to={`/vehicles/${vehicle._id}`}
                          className="font-medium text-primary-600 hover:underline"
                        >
                          {vehicle.registrationNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </td>
                      <td className="px-4 py-3 text-slate-600">{vehicle.vehicleType}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(vehicle.status)}>{vehicle.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{driver?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatNumber(vehicle.currentOdometer)} km
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/vehicles/${vehicle._id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(vehicle._id)}
                            leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
