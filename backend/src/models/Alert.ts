import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertEntityType =
  | 'VEHICLE'
  | 'DRIVER'
  | 'DOCUMENT'
  | 'MAINTENANCE'
  | 'TRIP'
  | 'SYSTEM';

export type AlertType =
  | 'INSURANCE_EXPIRED'
  | 'INSURANCE_EXPIRING'
  | 'PUC_EXPIRED'
  | 'PUC_EXPIRING'
  | 'LICENSE_EXPIRED'
  | 'LICENSE_EXPIRING'
  | 'SERVICE_DUE'
  | 'DOCUMENT_EXPIRED'
  | 'DOCUMENT_EXPIRING'
  | 'OTHER';

export interface IAlert {
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  entityType: AlertEntityType;
  entityId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AlertDocument = Document<Types.ObjectId> & IAlert;

const alertSchema = new Schema<IAlert>(
  {
    type: {
      type: String,
      enum: [
        'INSURANCE_EXPIRED',
        'INSURANCE_EXPIRING',
        'PUC_EXPIRED',
        'PUC_EXPIRING',
        'LICENSE_EXPIRED',
        'LICENSE_EXPIRING',
        'SERVICE_DUE',
        'DOCUMENT_EXPIRED',
        'DOCUMENT_EXPIRING',
        'OTHER',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'WARNING',
    },
    entityType: {
      type: String,
      enum: ['VEHICLE', 'DRIVER', 'DOCUMENT', 'MAINTENANCE', 'TRIP', 'SYSTEM'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alertSchema.index({ isRead: 1, createdAt: -1 });
alertSchema.index({ severity: 1 });

// Singleton model (single Mongo connection)
export const Alert: Model<IAlert> = mongoose.models.Alert || mongoose.model<IAlert>('Alert', alertSchema);

