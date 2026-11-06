import { Alert, Driver, Expense, FuelRecord, MaintenanceRecord, Trip, Vehicle } from '../models';

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboard() {
  const monthStart = startOfMonth();
  const sixMonthsAgo = monthsAgo(5);

  const [
    totalVehicles,
    activeVehicles,
    maintenanceVehicles,
    totalDrivers,
    activeDrivers,
    activeTrips,
    monthlyFuel,
    monthlyMaintenance,
    totalExpensesMonth,
    vehicleStatusBreakdown,
    monthlyExpenses,
    fuelByMonth,
    maintenanceByMonth,
  ] = await Promise.all([
    Vehicle.countDocuments(),
    Vehicle.countDocuments({ status: 'ACTIVE' }),
    Vehicle.countDocuments({ status: 'MAINTENANCE' }),
    Driver.countDocuments(),
    Driver.countDocuments({ status: 'ACTIVE' }),
    Trip.countDocuments({ status: { $in: ['ASSIGNED', 'STARTED'] } }),
    FuelRecord.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    MaintenanceRecord.aggregate([
      { $match: { serviceDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Vehicle.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Expense.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    FuelRecord.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    MaintenanceRecord.aggregate([
      { $match: { serviceDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$serviceDate' }, month: { $month: '$serviceDate' } },
          total: { $sum: '$cost' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const unreadAlerts = await Alert.countDocuments({ isRead: false });

  const completedTrips = await Trip.countDocuments({ status: 'COMPLETED' });
  const utilization = totalVehicles > 0 ? Math.round((activeTrips / totalVehicles) * 100) : 0;

  type StatusAgg = { _id: string; count: number };
  type MonthAgg = { _id: { year: number; month: number }; total: number };

  return {
    summary: {
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance: maintenanceVehicles,
      totalDrivers,
      activeDrivers,
      activeTrips,
      monthlyFuelCost: monthlyFuel[0]?.total ?? 0,
      monthlyMaintenanceCost: monthlyMaintenance[0]?.total ?? 0,
      totalExpenses: totalExpensesMonth[0]?.total ?? 0,
      unreadAlerts,
      completedTrips,
      fleetUtilization: utilization,
    },
    charts: {
      vehicleStatus: (vehicleStatusBreakdown as StatusAgg[]).map((v) => ({
        status: v._id,
        count: v.count,
      })),
      monthlyExpenses: (monthlyExpenses as MonthAgg[]).map((e) => ({
        month: `${e._id.year}-${String(e._id.month).padStart(2, '0')}`,
        total: e.total,
      })),
      fuelExpenses: (fuelByMonth as MonthAgg[]).map((e) => ({
        month: `${e._id.year}-${String(e._id.month).padStart(2, '0')}`,
        total: e.total,
      })),
      maintenanceExpenses: (maintenanceByMonth as MonthAgg[]).map((e) => ({
        month: `${e._id.year}-${String(e._id.month).padStart(2, '0')}`,
        total: e.total,
      })),
    },
  };
}
