import mongoose, { Model, Schema, Types } from 'mongoose';

export type DocumentType = 'RC' | 'INSURANCE' | 'PUC' | 'PERMIT' | 'FITNESS' | 'TAX' | 'OTHER';
export type DocumentStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface IVehicleDocument {
  vehicleId: Types.ObjectId;
  documentType: DocumentType;
  documentNumber: string;
  issueDate: Date;
  expiryDate: Date;
  fileUrl?: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EXPIRING_SOON_DAYS = 30;

export function calculateDocumentStatus(expiryDate: Date): DocumentStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (expiry < now) return 'EXPIRED';
  const soon = new Date();
  soon.setDate(soon.getDate() + EXPIRING_SOON_DAYS);
  if (expiry <= soon) return 'EXPIRING_SOON';
  return 'VALID';
}

const vehicleDocumentSchema = new Schema<IVehicleDocument>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    documentType: {
      type: String,
      enum: ['RC', 'INSURANCE', 'PUC', 'PERMIT', 'FITNESS', 'TAX', 'OTHER'],
      required: true,
    },
    documentNumber: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['VALID', 'EXPIRING_SOON', 'EXPIRED'],
      default: 'VALID',
    },
  },
  { timestamps: true }
);

vehicleDocumentSchema.index({ vehicleId: 1 });
vehicleDocumentSchema.index({ expiryDate: 1 });
vehicleDocumentSchema.index({ status: 1 });

vehicleDocumentSchema.pre('save', function () {
  this.status = calculateDocumentStatus(this.expiryDate);
});

// Singleton model (single Mongo connection)
export const VehicleDocument: Model<IVehicleDocument> =
  mongoose.models.VehicleDocument ||
  mongoose.model<IVehicleDocument>('VehicleDocument', vehicleDocumentSchema);

