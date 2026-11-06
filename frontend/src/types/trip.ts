export type TripStatus = 'PLANNED' | 'ASSIGNED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export interface TripVehicleRef {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  currentOdometer?: number;
}

export interface TripDriverRef {
  _id: string;
  name: string;
  phone: string;
  employeeId: string;
  licenseNumber?: string;
}

export interface Trip {
  _id: string;
  vehicleId: TripVehicleRef | string;
  driverId: TripDriverRef | string;
  source: string;
  destination: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  startOdometer: number;
  endOdometer?: number;
  status: TripStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripInput {
  vehicleId: string;
  driverId: string;
  source: string;
  destination: string;
  startDate: string;
  expectedEndDate?: string;
  startOdometer: number;
  status?: TripStatus;
  notes?: string;
}

export interface TripUpdateInput {
  vehicleId?: string;
  driverId?: string;
  source?: string;
  destination?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  startOdometer?: number;
  endOdometer?: number;
  status?: TripStatus;
  notes?: string;
}

export const TRIP_STATUSES: TripStatus[] = [
  'PLANNED',
  'ASSIGNED',
  'STARTED',
  'COMPLETED',
  'CANCELLED',
];
