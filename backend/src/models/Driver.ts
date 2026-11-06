import mongoose, { Document, Model, Schema } from 'mongoose';

export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface IDriver {
  name: string;
  phone: string;
  email?: string;
  employeeId: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: Date;
  dateOfJoining: Date;
  status: DriverStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type DriverDocument = Document & IDriver;

const driverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseType: { type: String, required: true, trim: true },
    licenseExpiryDate: { type: Date, required: true },
    dateOfJoining: { type: Date, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

driverSchema.index({ status: 1 });

// Singleton model (single Mongo connection)
export const Driver: Model<IDriver> = mongoose.models.Driver || mongoose.model<IDriver>('Driver', driverSchema);

