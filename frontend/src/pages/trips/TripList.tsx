import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useDeleteTrip, useTrips } from '../../hooks/useTrips';
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
import { TRIP_STATUSES, type TripDriverRef, type TripVehicleRef } from '../../types/trip';
import { formatDate } from '../../utils/formatDate';

function refName(ref: TripVehicleRef | TripDriverRef | string | undefined, kind: 'vehicle' | 'driver') {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  if (kind === 'vehicle' && 'registrationNumber' in ref) return ref.registrationNumber;
  if (kind === 'driver' && 'name' in ref) return ref.name;
  return '—';
}

export default function TripList() {
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

  const { data, isLoading, isError, error, refetch } = useTrips(params);
  const deleteMutation = useDeleteTrip();

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Trip deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Trips"
        description="Plan and track fleet trips"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/trips/new')}>
            New Trip
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
            placeholder="Search source or destination..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            wrapperClassName="min-w-0 flex-1"
          />
          <Button type="submit" variant="outline" className="shrink-0" leftIcon={<Search className="h-4 w-4" />}>
            Search
          </Button>
        </form>
        <Select
          options={TRIP_STATUSES.map((s) => ({ label: s, value: s }))}
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
          title="No trips found"
          actionLabel="New Trip"
          onAction={() => navigate('/trips/new')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Route</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Driver</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Start</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((trip) => (
                  <tr key={trip._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link
                        to={`/trips/${trip._id}`}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        {trip.source} → {trip.destination}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {refName(trip.vehicleId, 'vehicle')}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{refName(trip.driverId, 'driver')}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(trip.startDate, true)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(trip.status)}>{trip.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/trips/${trip._id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(trip._id)}
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
        message="Delete this trip permanently?"
        loading={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
