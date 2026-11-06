import { z } from 'zod';

export const createTripSchema = z.object({
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  source: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.coerce.date(),
  expectedEndDate: z.coerce.date().optional(),
  startOdometer: z.coerce.number().min(0),
  status: z.enum(['PLANNED', 'ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

export const updateTripSchema = z.object({
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  source: z.string().optional(),
  destination: z.string().optional(),
  startDate: z.coerce.date().optional(),
  expectedEndDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
  startOdometer: z.coerce.number().min(0).optional(),
  endOdometer: z.coerce.number().min(0).optional(),
  status: z.enum(['PLANNED', 'ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
