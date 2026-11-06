import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type TripStatus = 'PLANNED' | 'ASSIGNED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export interface ITrip {
  vehicleId: Types.ObjectId;
  driverId: Types.ObjectId;
  source: string;
  destination: string;
  startDate: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  startOdometer: number;
  endOdometer?: number;
  status: TripStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TripDocument = Document<Types.ObjectId> & ITrip;

const tripSchema = new Schema<ITrip>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date },
    actualEndDate: { type: Date },
    startOdometer: { type: Number, required: true, min: 0 },
    endOdometer: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['PLANNED', 'ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

tripSchema.index({ vehicleId: 1 });
tripSchema.index({ driverId: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startDate: -1 });

// Singleton model (single Mongo connection)
export const Trip: Model<ITrip> = mongoose.models.Trip || mongoose.model<ITrip>('Trip', tripSchema);

