import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { FuelType } from './Vehicle';

export interface IFuelRecord {
  vehicleId: Types.ObjectId;
  date: Date;
  fuelType: FuelType;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  odometer: number;
  station?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FuelRecordDocument = Document<Types.ObjectId> & IFuelRecord;

const fuelRecordSchema = new Schema<IFuelRecord>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    date: { type: Date, required: true },
    fuelType: {
      type: String,
      enum: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'OTHER'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    odometer: { type: Number, required: true, min: 0 },
    station: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

fuelRecordSchema.pre('validate', function () {
  this.totalAmount = Number((this.quantity * this.pricePerUnit).toFixed(2));
});

fuelRecordSchema.index({ vehicleId: 1 });
fuelRecordSchema.index({ date: -1 });

// Singleton model (single Mongo connection)
export const FuelRecord: Model<IFuelRecord> =
  mongoose.models.FuelRecord || mongoose.model<IFuelRecord>('FuelRecord', fuelRecordSchema);

