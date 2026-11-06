import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from '../utils/jwt';

export interface IUserOrganization extends Document {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  role: UserRole;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userOrganizationSchema = new Schema<IUserOrganization>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT', 'DRIVER', 'VIEWER', 'READ_ONLY'],
      required: true,
    },
    isPrimary: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userOrganizationSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

export const UserOrganization = mongoose.model<IUserOrganization>(
  'UserOrganization',
  userOrganizationSchema
);

