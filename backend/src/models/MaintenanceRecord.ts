import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'SERVICE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface IMaintenanceRecord {
  vehicleId: Types.ObjectId;
  maintenanceType: MaintenanceType;
  description: string;
  serviceDate: Date;
  odometer: number;
  cost: number;
  vendor?: string;
  nextServiceDate?: Date;
  nextServiceOdometer?: number;
  status: MaintenanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type MaintenanceRecordDocument = Document<Types.ObjectId> & IMaintenanceRecord;

const maintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    maintenanceType: {
      type: String,
      enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'SERVICE'],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    serviceDate: { type: Date, required: true },
    odometer: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    vendor: { type: String, trim: true },
    nextServiceDate: { type: Date },
    nextServiceOdometer: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'COMPLETED',
    },
  },
  { timestamps: true }
);

maintenanceRecordSchema.index({ vehicleId: 1 });
maintenanceRecordSchema.index({ serviceDate: -1 });
maintenanceRecordSchema.index({ nextServiceDate: 1 });

// Singleton model (single Mongo connection)
export const MaintenanceRecord: Model<IMaintenanceRecord> =
  mongoose.models.MaintenanceRecord ||
  mongoose.model<IMaintenanceRecord>('MaintenanceRecord', maintenanceRecordSchema);

