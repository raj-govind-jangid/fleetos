import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ExpenseCategory =
  | 'FUEL'
  | 'MAINTENANCE'
  | 'INSURANCE'
  | 'TOLL'
  | 'PARKING'
  | 'TAX'
  | 'PERMIT'
  | 'OTHER';

export interface IExpense {
  vehicleId?: Types.ObjectId | null;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  description?: string;
  referenceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseDocument = Document<Types.ObjectId> & IExpense;

const expenseSchema = new Schema<IExpense>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    category: {
      type: String,
      enum: ['FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLL', 'PARKING', 'TAX', 'PERMIT', 'OTHER'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ vehicleId: 1 });

// Singleton model (single Mongo connection)
export const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);

