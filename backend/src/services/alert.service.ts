import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import { calculateDocumentStatus } from '../models/VehicleDocument';
import { AlertType, AlertSeverity } from '../models/Alert';
import { Alert, Driver, MaintenanceRecord, VehicleDocument } from '../models';

export async function listAlerts(
  query: PaginationQuery & { isRead?: string; severity?: string }
) {
  const { page, limit, skip, sort } = parsePagination(query);

  const filter: Record<string, unknown> = {};
  if (query.isRead === 'true') filter.isRead = true;
  if (query.isRead === 'false') filter.isRead = false;
  if (query.severity) filter.severity = query.severity;

  const [data, total] = await Promise.all([
    Alert.find(filter).sort(sort).skip(skip).limit(limit),
    Alert.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function markAlertRead(id: string) {
  const alert = await Alert.findByIdAndUpdate(id, { isRead: true }, { new: true });
  if (!alert) throw new NotFoundError('Alert not found', 'ALERT_NOT_FOUND');
  return alert;
}

export async function markAllAlertsRead() {
  await Alert.updateMany({ isRead: false }, { isRead: true });
  return { success: true };
}

async function upsertAlert(
  key: { type: AlertType; entityId: string },
  data: {
    title: string;
    message: string;
    severity: AlertSeverity;
    entityType: 'VEHICLE' | 'DRIVER' | 'DOCUMENT' | 'MAINTENANCE' | 'TRIP' | 'SYSTEM';
  }
) {
  const existing = await Alert.findOne({
    type: key.type,
    entityId: key.entityId,
    isRead: false,
  });
  if (existing) return existing;

  return Alert.create({
    type: key.type,
    entityId: key.entityId,
    ...data,
  });
}

/**
 * Scans tenant data and creates alerts for expiry / service due conditions.
 */
export async function generateAlerts() {
  const created: string[] = [];

  // Vehicle documents
  const docs = await VehicleDocument.find().populate(
    'vehicleId',
    'registrationNumber'
  );
  for (const doc of docs) {
    const status = calculateDocumentStatus(doc.expiryDate);
    doc.status = status;
    await doc.save();

    const reg =
      doc.vehicleId && typeof doc.vehicleId === 'object' && 'registrationNumber' in doc.vehicleId
        ? String((doc.vehicleId as { registrationNumber: string }).registrationNumber)
        : 'vehicle';

    if (status === 'EXPIRED') {
      const type: AlertType =
        doc.documentType === 'INSURANCE'
          ? 'INSURANCE_EXPIRED'
          : doc.documentType === 'PUC'
            ? 'PUC_EXPIRED'
            : 'DOCUMENT_EXPIRED';
      await upsertAlert(
        { type, entityId: doc._id.toString() },
        {
          title: `${doc.documentType} expired`,
          message: `${doc.documentType} for ${reg} expired on ${doc.expiryDate.toISOString().slice(0, 10)}`,
          severity: 'CRITICAL',
          entityType: 'DOCUMENT',
        }
      );
      created.push(type);
    } else if (status === 'EXPIRING_SOON') {
      const type: AlertType =
        doc.documentType === 'INSURANCE'
          ? 'INSURANCE_EXPIRING'
          : doc.documentType === 'PUC'
            ? 'PUC_EXPIRING'
            : 'DOCUMENT_EXPIRING';
      await upsertAlert(
        { type, entityId: doc._id.toString() },
        {
          title: `${doc.documentType} expiring soon`,
          message: `${doc.documentType} for ${reg} expires on ${doc.expiryDate.toISOString().slice(0, 10)}`,
          severity: 'WARNING',
          entityType: 'DOCUMENT',
        }
      );
      created.push(type);
    }
  }

  // Driver licenses
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  const drivers = await Driver.find({
    licenseExpiryDate: { $lte: soon },
    status: 'ACTIVE',
  });

  for (const driver of drivers) {
    const expired = driver.licenseExpiryDate < new Date();
    const type: AlertType = expired ? 'LICENSE_EXPIRED' : 'LICENSE_EXPIRING';
    await upsertAlert(
      { type, entityId: driver._id.toString() },
      {
        title: expired ? 'Driver license expired' : 'Driver license expiring',
        message: `License for ${driver.name} (${driver.licenseNumber}) ${expired ? 'expired' : 'expires'} on ${driver.licenseExpiryDate.toISOString().slice(0, 10)}`,
        severity: expired ? 'CRITICAL' : 'WARNING',
        entityType: 'DRIVER',
      }
    );
    created.push(type);
  }

  // Service due
  const maintenance = await MaintenanceRecord.find({
    nextServiceDate: { $lte: soon, $ne: null },
  }).populate('vehicleId', 'registrationNumber');

  for (const m of maintenance) {
    const reg =
      m.vehicleId && typeof m.vehicleId === 'object' && 'registrationNumber' in m.vehicleId
        ? String((m.vehicleId as { registrationNumber: string }).registrationNumber)
        : 'vehicle';
    await upsertAlert(
      { type: 'SERVICE_DUE', entityId: m._id.toString() },
      {
        title: 'Vehicle service due',
        message: `Service due for ${reg} on ${m.nextServiceDate?.toISOString().slice(0, 10)}`,
        severity: 'WARNING',
        entityType: 'MAINTENANCE',
      }
    );
    created.push('SERVICE_DUE');
  }

  return { generated: created.length };
}
