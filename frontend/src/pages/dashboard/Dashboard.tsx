import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Car,
  Fuel,
  Route,
  Users,
  Wrench,
  Wallet,
} from 'lucide-react';
import { getDashboard } from '../../services/dashboard.service';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  MonthlyBarChart,
  MonthlyLineChart,
  StatusPieChart,
} from '../../components/charts/DashboardCharts';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: typeof Car;
  accent?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, accent = 'bg-primary-50 text-primary-600' }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={cn('rounded-lg p-2.5', accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const { summary, charts } = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your fleet performance and costs"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Vehicles"
          value={formatNumber(summary.totalVehicles)}
          subtitle={`${summary.activeVehicles} active`}
          icon={Car}
        />
        <MetricCard
          title="Active Drivers"
          value={formatNumber(summary.activeDrivers)}
          subtitle={`${summary.totalDrivers} total`}
          icon={Users}
          accent="bg-sky-50 text-sky-600"
        />
        <MetricCard
          title="Active Trips"
          value={formatNumber(summary.activeTrips)}
          subtitle={`${summary.completedTrips} completed`}
          icon={Route}
          accent="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          title="Unread Alerts"
          value={formatNumber(summary.unreadAlerts)}
          subtitle={`${summary.fleetUtilization}% utilization`}
          icon={AlertTriangle}
          accent="bg-amber-50 text-amber-600"
        />
        <MetricCard
          title="Fuel (This Month)"
          value={formatCurrency(summary.monthlyFuelCost)}
          icon={Fuel}
          accent="bg-orange-50 text-orange-600"
        />
        <MetricCard
          title="Maintenance (Month)"
          value={formatCurrency(summary.monthlyMaintenanceCost)}
          subtitle={`${summary.vehiclesInMaintenance} in maintenance`}
          icon={Wrench}
          accent="bg-violet-50 text-violet-600"
        />
        <MetricCard
          title="Expenses (Month)"
          value={formatCurrency(summary.totalExpenses)}
          icon={Wallet}
          accent="bg-slate-100 text-slate-600"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <StatusPieChart data={charts.vehicleStatus} title="Vehicle Status Breakdown" />
        <MonthlyBarChart data={charts.monthlyExpenses} title="Monthly Expenses" />
        <MonthlyLineChart data={charts.fuelExpenses} title="Fuel Expenses Trend" color="#ea580c" />
        <MonthlyBarChart
          data={charts.maintenanceExpenses}
          title="Maintenance Expenses"
          color="#64748b"
        />
      </div>
    </div>
  );
}
