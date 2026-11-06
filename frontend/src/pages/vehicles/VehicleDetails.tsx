import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useAssignDriver, useDeleteVehicle, useVehicle } from '../../hooks/useVehicles';
import { useDrivers } from '../../hooks/useDrivers';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState, DetailRow } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import type { AssignedDriver } from '../../types/vehicle';
import { formatNumber } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: vehicle, isLoading, isError, error, refetch } = useVehicle(id);
  const { data: driversData } = useDrivers({ limit: 100, status: 'ACTIVE' });
  const deleteMutation = useDeleteVehicle();
  const assignMutation = useAssignDriver();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [driverId, setDriverId] = useState('');

  if (isLoading) return <PageLoader />;
  if (isError || !vehicle) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const driver =
    vehicle.assignedDriverId && typeof vehicle.assignedDriverId === 'object'
      ? (vehicle.assignedDriverId as AssignedDriver)
      : null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(vehicle._id);
      toast.success('Vehicle deleted');
      navigate('/vehicles');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAssign = async () => {
    try {
      await assignMutation.mutateAsync({
        id: vehicle._id,
        driverId: driverId || null,
      });
      toast.success(driverId ? 'Driver assigned' : 'Driver unassigned');
      setAssignOpen(false);
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
        onClick={() => navigate('/vehicles')}
      >
        Back to vehicles
      </Button>

      <PageHeader
        title={vehicle.registrationNumber}
        description={`${vehicle.make} ${vehicle.model} · ${vehicle.year}`}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => {
                setDriverId(driver?._id ?? '');
                setAssignOpen(true);
              }}
            >
              Assign Driver
            </Button>
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => navigate(`/vehicles/${vehicle._id}/edit`)}
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
            value={<Badge variant={statusBadgeVariant(vehicle.status)}>{vehicle.status}</Badge>}
          />
          <DetailRow label="Type" value={vehicle.vehicleType} />
          <DetailRow label="Fuel Type" value={vehicle.fuelType} />
          <DetailRow label="Color" value={vehicle.color} />
          <DetailRow label="VIN" value={vehicle.vin} />
          <DetailRow label="Engine Number" value={vehicle.engineNumber} />
          <DetailRow label="Odometer" value={`${formatNumber(vehicle.currentOdometer)} km`} />
          <DetailRow
            label="Assigned Driver"
            value={
              driver ? (
                <Link to={`/drivers/${driver._id}`} className="text-primary-600 hover:underline">
                  {driver.name} ({driver.employeeId})
                </Link>
              ) : (
                'Unassigned'
              )
            }
          />
          <DetailRow label="Created" value={formatDate(vehicle.createdAt, true)} />
          <DetailRow label="Updated" value={formatDate(vehicle.updatedAt, true)} />
        </dl>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        message="Delete this vehicle permanently?"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Driver"
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button loading={assignMutation.isPending} onClick={() => void handleAssign()}>
              Save
            </Button>
          </>
        }
      >
        <Select
          label="Driver"
          placeholder="Unassigned"
          options={(driversData?.data ?? []).map((d) => ({
            label: `${d.name} (${d.employeeId})`,
            value: d._id,
          }))}
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        />
      </Modal>
    </div>
  );
}
