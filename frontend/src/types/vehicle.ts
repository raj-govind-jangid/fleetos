export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SOLD';
export type VehicleType = 'CAR' | 'SUV' | 'TRUCK' | 'BUS' | 'VAN' | 'BIKE' | 'OTHER';
export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID' | 'OTHER';

export interface AssignedDriver {
  _id: string;
  name: string;
  phone: string;
  employeeId: string;
  licenseNumber?: string;
}

export interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  color?: string;
  vin?: string;
  engineNumber?: string;
  status: VehicleStatus;
  currentOdometer: number;
  assignedDriverId?: AssignedDriver | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  color?: string;
  vin?: string;
  engineNumber?: string;
  status?: VehicleStatus;
  currentOdometer?: number;
  assignedDriverId?: string | null;
}

export const VEHICLE_STATUSES: VehicleStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SOLD'];
export const VEHICLE_TYPES: VehicleType[] = ['CAR', 'SUV', 'TRUCK', 'BUS', 'VAN', 'BIKE', 'OTHER'];
export const FUEL_TYPES: FuelType[] = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'OTHER'];
