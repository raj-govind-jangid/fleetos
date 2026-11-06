/**
 * Seed script — creates demo organization, users, and tenant fleet data.
 *
 * Usage: npm run seed
 *
 * Login: admin@fleetos.com / Oneplus@123
 */
import mongoose from 'mongoose';
import { connectMainDatabase, disconnectMainDatabase } from '../config/database';
import {
  Activity,
  Alert,
  Driver,
  Expense,
  FuelRecord,
  MaintenanceRecord,
  Trip,
  Vehicle,
  VehicleDocument,
  Organization,
  User,
  UserOrganization,
} from '../models';
import { hashPassword } from '../utils/password';

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log('Seeding FleetOS demo data...');
  await connectMainDatabase();

  // Clear existing demo data (idempotent-ish for local dev)
  await Promise.all([
    User.deleteMany({ email: /@fleetos\.com$/ }),
    Organization.deleteMany({ email: 'admin@fleetos.com' }),
    UserOrganization.deleteMany({}),
  ]);

  const org = await Organization.create({
    name: 'Demo Fleet Logistics',
    email: 'admin@fleetos.com',
    phone: '+91-9876543210',
    address: '101 Industrial Area',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    status: 'ACTIVE',
    tenantDbName: 'main',
  });

  const adminPasswordHash = await hashPassword('Oneplus@123');

  const viewerPasswordHash = await hashPassword('Viewer@123');

  const usersData = [
    { name: 'Admin User', email: 'admin@fleetos.com', role: 'ADMIN' as const },
    { name: 'Fleet Manager', email: 'manager@fleetos.com', role: 'FLEET_MANAGER' as const },
    { name: 'Accountant', email: 'accounts@fleetos.com', role: 'ACCOUNTANT' as const },
    { name: 'Driver Portal', email: 'driver@fleetos.com', role: 'DRIVER' as const },
    { name: 'Read Only User', email: 'viewer@fleetos.com', role: 'READ_ONLY' as const },
  ];

  const users = await User.insertMany(
    usersData.map((u) => ({
      ...u,
      passwordHash: u.role === 'READ_ONLY' ? viewerPasswordHash : adminPasswordHash,
      organizationId: org._id,
      status: 'ACTIVE',
    }))
  );

  await UserOrganization.insertMany(
    users.map((u) => ({
      userId: u._id,
      organizationId: org._id,
      role: u.role,
      isPrimary: true,
    }))
  );

  const models = {
    Vehicle,
    Driver,
    VehicleDocument,
    Trip,
    FuelRecord,
    MaintenanceRecord,
    Expense,
    Alert,
    Activity,
  };

  // Wipe tenant collections for clean seed
  await Promise.all([
    models.Vehicle.deleteMany({}),
    models.Driver.deleteMany({}),
    models.VehicleDocument.deleteMany({}),
    models.Trip.deleteMany({}),
    models.FuelRecord.deleteMany({}),
    models.MaintenanceRecord.deleteMany({}),
    models.Expense.deleteMany({}),
    models.Alert.deleteMany({}),
    models.Activity.deleteMany({}),
  ]);

  const makes = [
    ['Tata', 'Ace'],
    ['Tata', 'Prima'],
    ['Ashok Leyland', 'Dost'],
    ['Mahindra', 'Bolero'],
    ['Mahindra', 'Scorpio'],
    ['Maruti', 'Eeco'],
    ['Hyundai', 'Creta'],
    ['Toyota', 'Innova'],
    ['Force', 'Traveller'],
    ['Eicher', 'Pro 2049'],
  ];
  const types = ['CAR', 'SUV', 'TRUCK', 'BUS', 'VAN', 'BIKE', 'OTHER'] as const;
  const fuels = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC'] as const;
  const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'MAINTENANCE', 'INACTIVE'] as const;

  const vehicles = [];
  for (let i = 1; i <= 20; i++) {
    const [make, model] = pick(makes);
    vehicles.push(
      await models.Vehicle.create({
        registrationNumber: `RJ14AB${1000 + i}`,
        make,
        model,
        year: randomInt(2016, 2025),
        vehicleType: pick([...types]),
        fuelType: pick([...fuels]),
        color: pick(['White', 'Silver', 'Black', 'Blue', 'Red']),
        vin: `VINDEMO${100000 + i}`,
        engineNumber: `ENG${200000 + i}`,
        status: pick([...statuses]),
        currentOdometer: randomInt(10000, 180000),
      })
    );
  }

  const driverNames = [
    'Ravi Sharma',
    'Amit Kumar',
    'Suresh Yadav',
    'Vikram Singh',
    'Rahul Meena',
    'Deepak Verma',
    'Manoj Gupta',
    'Anil Joshi',
    'Sanjay Patel',
    'Karan Malhotra',
  ];

  const drivers = [];
  for (let i = 0; i < 10; i++) {
    drivers.push(
      await models.Driver.create({
        name: driverNames[i],
        phone: `98765${String(10000 + i).slice(-5)}`,
        email: `driver${i + 1}@demo.fleetos.com`,
        employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
        licenseNumber: `RJ-DL-${2000 + i}`,
        licenseType: pick(['LMV', 'HMV', 'MCWG']),
        licenseExpiryDate: daysFromNow(pick([-10, 15, 45, 90, 180])),
        dateOfJoining: daysAgo(randomInt(60, 1200)),
        status: 'ACTIVE',
      })
    );
  }

  // Assign first 8 drivers to vehicles
  for (let i = 0; i < 8; i++) {
    vehicles[i].assignedDriverId = drivers[i]._id;
    await vehicles[i].save();
  }

  const docTypes = ['RC', 'INSURANCE', 'PUC', 'PERMIT', 'FITNESS', 'TAX'] as const;
  for (let i = 0; i < 20; i++) {
    const vehicle = vehicles[i % vehicles.length];
    const docType = docTypes[i % docTypes.length];
    await models.VehicleDocument.create({
      vehicleId: vehicle._id,
      documentType: docType,
      documentNumber: `${docType}-${1000 + i}`,
      issueDate: daysAgo(randomInt(100, 400)),
      expiryDate: daysFromNow(pick([-20, -5, 10, 25, 60, 200])),
      fileUrl: `/uploads/demo-${docType.toLowerCase()}-${i}.pdf`,
    });
  }

  const cities = ['Jaipur', 'Delhi', 'Mumbai', 'Ahmedabad', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer'];
  const tripStatuses = ['PLANNED', 'ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED'] as const;
  for (let i = 0; i < 30; i++) {
    const vehicle = pick(vehicles);
    const driver = pick(drivers);
    const status = pick([...tripStatuses]);
    const startOdo = vehicle.currentOdometer - randomInt(100, 2000);
    await models.Trip.create({
      vehicleId: vehicle._id,
      driverId: driver._id,
      source: pick(cities),
      destination: pick(cities),
      startDate: daysAgo(randomInt(1, 90)),
      expectedEndDate: daysAgo(randomInt(0, 80)),
      actualEndDate: status === 'COMPLETED' ? daysAgo(randomInt(0, 70)) : undefined,
      startOdometer: Math.max(0, startOdo),
      endOdometer: status === 'COMPLETED' ? startOdo + randomInt(50, 800) : undefined,
      status,
      notes: status === 'CANCELLED' ? 'Cancelled due to weather' : 'Demo trip',
    });
  }

  for (let i = 0; i < 50; i++) {
    const vehicle = pick(vehicles);
    const quantity = Number((Math.random() * 40 + 10).toFixed(1));
    const pricePerUnit = Number((Math.random() * 20 + 90).toFixed(2));
    const totalAmount = Number((quantity * pricePerUnit).toFixed(2));
    const date = daysAgo(randomInt(1, 150));

    const fuel = await models.FuelRecord.create({
      vehicleId: vehicle._id,
      date,
      fuelType: vehicle.fuelType,
      quantity,
      pricePerUnit,
      totalAmount,
      odometer: vehicle.currentOdometer - randomInt(0, 5000),
      station: pick(['IOCL Jaipur', 'BPCL Delhi', 'HP Mumbai', 'Nayara Kota']),
      notes: 'Demo fuel fill',
    });

    await models.Expense.create({
      vehicleId: vehicle._id,
      category: 'FUEL',
      amount: totalAmount,
      date,
      description: `Fuel fill ${quantity}L`,
      referenceNumber: fuel._id.toString(),
    });
  }

  const maintTypes = ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'SERVICE'] as const;
  for (let i = 0; i < 30; i++) {
    const vehicle = pick(vehicles);
    const cost = randomInt(1500, 25000);
    const serviceDate = daysAgo(randomInt(1, 180));
    const record = await models.MaintenanceRecord.create({
      vehicleId: vehicle._id,
      maintenanceType: pick([...maintTypes]),
      description: pick([
        'Oil change and filter',
        'Brake pad replacement',
        'Engine tune-up',
        'Tyre replacement',
        'AC servicing',
        'Battery replacement',
      ]),
      serviceDate,
      odometer: vehicle.currentOdometer - randomInt(0, 8000),
      cost,
      vendor: pick(['AutoCare Garage', 'FleetFix Motors', 'City Service Hub']),
      nextServiceDate: daysFromNow(pick([-5, 10, 30, 60, 90])),
      nextServiceOdometer: vehicle.currentOdometer + randomInt(2000, 10000),
      status: 'COMPLETED',
    });

    await models.Expense.create({
      vehicleId: vehicle._id,
      category: 'MAINTENANCE',
      amount: cost,
      date: serviceDate,
      description: record.description,
      referenceNumber: record._id.toString(),
    });
  }

  const extraCategories = ['INSURANCE', 'TOLL', 'PARKING', 'TAX', 'PERMIT', 'OTHER'] as const;
  for (let i = 0; i < 20; i++) {
    await models.Expense.create({
      vehicleId: pick(vehicles)._id,
      category: pick([...extraCategories]),
      amount: randomInt(100, 15000),
      date: daysAgo(randomInt(1, 120)),
      description: 'Demo operational expense',
      referenceNumber: `EXP-${3000 + i}`,
    });
  }

  // Seed ~20 alerts
  const alertDefs = [
    {
      type: 'INSURANCE_EXPIRED' as const,
      title: 'Insurance expired',
      message: 'Insurance for RJ14AB1001 has expired',
      severity: 'CRITICAL' as const,
      entityType: 'DOCUMENT' as const,
    },
    {
      type: 'INSURANCE_EXPIRING' as const,
      title: 'Insurance expiring soon',
      message: 'Insurance for RJ14AB1002 expires within 30 days',
      severity: 'WARNING' as const,
      entityType: 'DOCUMENT' as const,
    },
    {
      type: 'PUC_EXPIRED' as const,
      title: 'PUC expired',
      message: 'PUC for RJ14AB1003 has expired',
      severity: 'CRITICAL' as const,
      entityType: 'DOCUMENT' as const,
    },
    {
      type: 'PUC_EXPIRING' as const,
      title: 'PUC expiring soon',
      message: 'PUC for RJ14AB1004 expires soon',
      severity: 'WARNING' as const,
      entityType: 'DOCUMENT' as const,
    },
    {
      type: 'LICENSE_EXPIRING' as const,
      title: 'Driver license expiring',
      message: 'License for Ravi Sharma expires soon',
      severity: 'WARNING' as const,
      entityType: 'DRIVER' as const,
    },
    {
      type: 'LICENSE_EXPIRED' as const,
      title: 'Driver license expired',
      message: 'License for Amit Kumar has expired',
      severity: 'CRITICAL' as const,
      entityType: 'DRIVER' as const,
    },
    {
      type: 'SERVICE_DUE' as const,
      title: 'Vehicle service due',
      message: 'Service due for RJ14AB1005',
      severity: 'WARNING' as const,
      entityType: 'MAINTENANCE' as const,
    },
  ];

  for (let i = 0; i < 20; i++) {
    const def = alertDefs[i % alertDefs.length];
    await models.Alert.create({
      ...def,
      entityId: i % 2 === 0 ? vehicles[i % vehicles.length]._id : drivers[i % drivers.length]._id,
      isRead: i > 12,
    });
  }

  await models.Activity.create({
    action: 'SEED',
    entityType: 'SYSTEM',
    description: 'Demo data seeded successfully',
    performedBy: 'seed-script',
  });

  console.log('Seed complete!');
  console.log('');
  console.log('Organization:', org.name, `(${org._id})`);
  console.log('Users: 5 | Vehicles: 20 | Drivers: 10 | Trips: 30');
  console.log('Fuel: 50 | Maintenance: 30 | Expenses: ~70 | Alerts: 20');
  console.log('');
  console.log('Login credentials:');
  console.log('  Email:    admin@fleetos.com');
  console.log('  Password: Oneplus@123');
  console.log('');
  console.log('Other users (same password):');
  usersData.forEach((u) => console.log(`  ${u.email} (${u.role})`));
  await disconnectMainDatabase();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
