import { z } from 'zod';

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  vehicleType: z.enum(['CAR', 'SUV', 'TRUCK', 'BUS', 'VAN', 'BIKE', 'OTHER']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'OTHER']),
  color: z.string().optional(),
  vin: z.string().optional(),
  engineNumber: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SOLD']).optional(),
  currentOdometer: z.coerce.number().min(0).optional(),
  assignedDriverId: z.string().nullable().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const assignDriverSchema = z.object({
  driverId: z.string().nullable(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
