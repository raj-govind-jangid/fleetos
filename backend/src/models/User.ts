import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from '../utils/jwt';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  organizationId: Types.ObjectId;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT', 'DRIVER', 'VIEWER', 'READ_ONLY'],
      required: true,
      default: 'VIEWER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

userSchema.index({ organizationId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);

