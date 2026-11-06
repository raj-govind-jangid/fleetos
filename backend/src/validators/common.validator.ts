import { z } from 'zod';

export const createFuelSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.coerce.date(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'OTHER']),
  quantity: z.coerce.number().positive(),
  pricePerUnit: z.coerce.number().min(0),
  odometer: z.coerce.number().min(0),
  station: z.string().optional(),
  notes: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  maintenanceType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'SERVICE']),
  description: z.string().min(1),
  serviceDate: z.coerce.date(),
  odometer: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  vendor: z.string().optional(),
  nextServiceDate: z.coerce.date().optional(),
  nextServiceOdometer: z.coerce.number().min(0).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const createExpenseSchema = z.object({
  vehicleId: z.string().nullable().optional(),
  category: z.enum([
    'FUEL',
    'MAINTENANCE',
    'INSURANCE',
    'TOLL',
    'PARKING',
    'TAX',
    'PERMIT',
    'OTHER',
  ]),
  amount: z.coerce.number().min(0),
  date: z.coerce.date(),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export const createDocumentSchema = z.object({
  vehicleId: z.string().min(1),
  documentType: z.enum(['RC', 'INSURANCE', 'PUC', 'PERMIT', 'FITNESS', 'TAX', 'OTHER']),
  documentNumber: z.string().min(1),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  fileUrl: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT', 'DRIVER', 'VIEWER', 'READ_ONLY']),
});
