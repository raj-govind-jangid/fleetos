import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IActivity {
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  description: string;
  performedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityDocument = Document<Types.ObjectId> & IActivity;

const activitySchema = new Schema<IActivity>(
  {
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true },
    performedBy: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

// Singleton model (single Mongo connection)
export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', activitySchema);

