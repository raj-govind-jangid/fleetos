import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SOLD';
export type VehicleType = 'CAR' | 'SUV' | 'TRUCK' | 'BUS' | 'VAN' | 'BIKE' | 'OTHER';
export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID' | 'OTHER';

export interface IVehicle {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  color?: string;
  vin?: string;
  engineNumber?: string;
  status: VehicleStatus;
  currentOdometer: number;
  assignedDriverId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type VehicleDocument = Document<Types.ObjectId> & IVehicle;

const vehicleSchema = new Schema<IVehicle>(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    vehicleType: {
      type: String,
      enum: ['CAR', 'SUV', 'TRUCK', 'BUS', 'VAN', 'BIKE', 'OTHER'],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'OTHER'],
      required: true,
    },
    color: { type: String, trim: true },
    vin: { type: String, trim: true },
    engineNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SOLD'],
      default: 'ACTIVE',
    },
    currentOdometer: { type: Number, default: 0, min: 0 },
    assignedDriverId: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
  },
  { timestamps: true }
);

vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleType: 1 });

// Singleton model (single Mongo connection)
export const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', vehicleSchema);

