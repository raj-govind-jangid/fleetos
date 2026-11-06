import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useDeleteDriver, useDriver } from '../../hooks/useDrivers';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState, DetailRow } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function DriverDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading, isError, error, refetch } = useDriver(id);
  const deleteMutation = useDeleteDriver();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <PageLoader />;
  if (isError || !data?.driver) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const { driver, assignedVehicle, recentTrips } = data;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(driver._id);
      toast.success('Driver deleted');
      navigate('/drivers');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/drivers')}
        >
          Back to drivers
        </Button>

        <PageHeader
          title={driver.name}
          description={`Employee ID: ${driver.employeeId}`}
          actions={
            <>
              <Button
                variant="outline"
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => navigate(`/drivers/${driver._id}/edit`)}
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Profile
        </h2>
        <dl>
          <DetailRow
            label="Status"
            value={<Badge variant={statusBadgeVariant(driver.status)}>{driver.status}</Badge>}
          />
          <DetailRow label="Phone" value={driver.phone} />
          <DetailRow label="Email" value={driver.email || '—'} />
          <DetailRow label="License Number" value={driver.licenseNumber} />
          <DetailRow label="License Type" value={driver.licenseType} />
          <DetailRow label="License Expiry" value={formatDate(driver.licenseExpiryDate)} />
          <DetailRow label="Date of Joining" value={formatDate(driver.dateOfJoining)} />
          <DetailRow label="Created" value={formatDate(driver.createdAt, true)} />
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Assigned Vehicle
        </h2>
        {assignedVehicle ? (
          <dl>
            <DetailRow
              label="Registration"
              value={
                <Link
                  to={`/vehicles/${assignedVehicle._id}`}
                  className="font-medium text-primary-600 hover:underline"
                >
                  {assignedVehicle.registrationNumber}
                </Link>
              }
            />
            <DetailRow
              label="Vehicle"
              value={`${assignedVehicle.make} ${assignedVehicle.model}`}
            />
            <DetailRow
              label="Status"
              value={
                <Badge variant={statusBadgeVariant(assignedVehicle.status)}>
                  {assignedVehicle.status}
                </Badge>
              }
            />
          </dl>
        ) : (
          <EmptyState title="No vehicle assigned" description="This driver is not assigned to a vehicle." />
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent Trips
        </h2>
        {recentTrips.length === 0 ? (
          <EmptyState title="No trips yet" description="Trips for this driver will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-2 py-2 font-medium">Route</th>
                  <th className="px-2 py-2 font-medium">Start</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip._id} className="border-b border-slate-50">
                    <td className="px-2 py-2.5">
                      <Link
                        to={`/trips/${trip._id}`}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        {trip.source} → {trip.destination}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-slate-700">{formatDate(trip.startDate)}</td>
                    <td className="px-2 py-2.5">
                      <Badge variant={statusBadgeVariant(trip.status)}>{trip.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        message="Delete this driver permanently?"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
