import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useDeleteTrip, useTrip } from '../../hooks/useTrips';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState, DetailRow } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { formatNumber } from '../../utils/formatCurrency';

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: trip, isLoading, isError, error, refetch } = useTrip(id);
  const deleteMutation = useDeleteTrip();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <PageLoader />;
  if (isError || !trip) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const vehicle =
    trip.vehicleId && typeof trip.vehicleId === 'object' ? trip.vehicleId : null;
  const driver =
    trip.driverId && typeof trip.driverId === 'object' ? trip.driverId : null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(trip._id);
      toast.success('Trip deleted');
      navigate('/trips');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-2"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate('/trips')}
      >
        Back to trips
      </Button>

      <PageHeader
        title={`${trip.source} → ${trip.destination}`}
        description={`Started ${formatDate(trip.startDate, true)}`}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => navigate(`/trips/${trip._id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <dl>
          <DetailRow
            label="Status"
            value={<Badge variant={statusBadgeVariant(trip.status)}>{trip.status}</Badge>}
          />
          <DetailRow
            label="Vehicle"
            value={
              vehicle ? (
                <Link to={`/vehicles/${vehicle._id}`} className="text-primary-600 hover:underline">
                  {vehicle.registrationNumber} — {vehicle.make} {vehicle.model}
                </Link>
              ) : (
                '—'
              )
            }
          />
          <DetailRow
            label="Driver"
            value={
              driver ? (
                <Link to={`/drivers/${driver._id}`} className="text-primary-600 hover:underline">
                  {driver.name} ({driver.employeeId})
                </Link>
              ) : (
                '—'
              )
            }
          />
          <DetailRow label="Start Date" value={formatDate(trip.startDate, true)} />
          <DetailRow label="Expected End" value={formatDate(trip.expectedEndDate, true)} />
          <DetailRow label="Actual End" value={formatDate(trip.actualEndDate, true)} />
          <DetailRow label="Start Odometer" value={`${formatNumber(trip.startOdometer)} km`} />
          <DetailRow
            label="End Odometer"
            value={trip.endOdometer != null ? `${formatNumber(trip.endOdometer)} km` : '—'}
          />
          <DetailRow label="Notes" value={trip.notes} />
        </dl>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        message="Delete this trip permanently?"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
