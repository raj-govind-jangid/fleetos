import type { FuelType } from './vehicle';

export interface FuelRecord {
  _id: string;
  vehicleId:
    | string
    | {
        _id: string;
        registrationNumber: string;
        make?: string;
        model?: string;
      };
  date: string;
  fuelType: FuelType;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  odometer: number;
  station?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelInput {
  vehicleId: string;
  date: string;
  fuelType: FuelType;
  quantity: number;
  pricePerUnit: number;
  odometer: number;
  station?: string;
  notes?: string;
}

export interface FuelSummary {
  totalAmount?: number;
  totalQuantity?: number;
  count?: number;
  byFuelType?: Array<{ fuelType: string; total: number; quantity: number }>;
}

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'SERVICE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MaintenanceRecord {
  _id: string;
  vehicleId:
    | string
    | {
        _id: string;
        registrationNumber: string;
        make?: string;
        model?: string;
      };
  maintenanceType: MaintenanceType;
  description: string;
  serviceDate: string;
  odometer: number;
  cost: number;
  vendor?: string;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceInput {
  vehicleId: string;
  maintenanceType: MaintenanceType;
  description: string;
  serviceDate: string;
  odometer: number;
  cost: number;
  vendor?: string;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  status?: MaintenanceStatus;
}

export type ExpenseCategory =
  | 'FUEL'
  | 'MAINTENANCE'
  | 'INSURANCE'
  | 'TOLL'
  | 'PARKING'
  | 'TAX'
  | 'PERMIT'
  | 'OTHER';

export interface Expense {
  _id: string;
  vehicleId?:
    | string
    | null
    | {
        _id: string;
        registrationNumber: string;
      };
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  vehicleId?: string | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  referenceNumber?: string;
}

export type DocumentType = 'RC' | 'INSURANCE' | 'PUC' | 'PERMIT' | 'FITNESS' | 'TAX' | 'OTHER';
export type DocumentStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface VehicleDocument {
  _id: string;
  vehicleId:
    | string
    | {
        _id: string;
        registrationNumber: string;
      };
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentInput {
  vehicleId: string;
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  file?: File | null;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertEntityType = 'VEHICLE' | 'DRIVER' | 'DOCUMENT' | 'MAINTENANCE' | 'TRIP' | 'SYSTEM';
export type AlertType =
  | 'INSURANCE_EXPIRED'
  | 'INSURANCE_EXPIRING'
  | 'PUC_EXPIRED'
  | 'PUC_EXPIRING'
  | 'LICENSE_EXPIRING'
  | 'LICENSE_EXPIRED'
  | 'SERVICE_DUE'
  | 'DOCUMENT_EXPIRED'
  | 'DOCUMENT_EXPIRING'
  | 'OTHER';

export interface Alert {
  _id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  entityType: AlertEntityType;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesInMaintenance: number;
  totalDrivers: number;
  activeDrivers: number;
  activeTrips: number;
  monthlyFuelCost: number;
  monthlyMaintenanceCost: number;
  totalExpenses: number;
  unreadAlerts: number;
  completedTrips: number;
  fleetUtilization: number;
}

export interface DashboardCharts {
  vehicleStatus: Array<{ status: string; count: number }>;
  monthlyExpenses: Array<{ month: string; total: number }>;
  fuelExpenses: Array<{ month: string; total: number }>;
  maintenanceExpenses: Array<{ month: string; total: number }>;
}

export interface DashboardData {
  summary: DashboardSummary;
  charts: DashboardCharts;
}

export const MAINTENANCE_TYPES: MaintenanceType[] = [
  'PREVENTIVE',
  'CORRECTIVE',
  'EMERGENCY',
  'SERVICE',
];
export const MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'FUEL',
  'MAINTENANCE',
  'INSURANCE',
  'TOLL',
  'PARKING',
  'TAX',
  'PERMIT',
  'OTHER',
];
export const DOCUMENT_TYPES: DocumentType[] = [
  'RC',
  'INSURANCE',
  'PUC',
  'PERMIT',
  'FITNESS',
  'TAX',
  'OTHER',
];
export const DOCUMENT_STATUSES: DocumentStatus[] = ['VALID', 'EXPIRING_SOON', 'EXPIRED'];
