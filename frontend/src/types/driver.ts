export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  employeeId: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: string;
  dateOfJoining: string;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DriverInput {
  name: string;
  phone: string;
  email?: string;
  employeeId: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: string;
  dateOfJoining: string;
  status?: DriverStatus;
}

export interface DriverAssignedVehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  status: string;
}

export interface DriverRecentTrip {
  _id: string;
  source: string;
  destination: string;
  startDate: string;
  status: string;
  vehicleId?: string;
}

/** GET /drivers/:id returns driver plus related fleet data */
export interface DriverDetailsResponse {
  driver: Driver;
  assignedVehicle: DriverAssignedVehicle | null;
  recentTrips: DriverRecentTrip[];
}

export const DRIVER_STATUSES: DriverStatus[] = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];
