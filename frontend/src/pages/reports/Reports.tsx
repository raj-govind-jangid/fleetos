import { useQuery } from '@tanstack/react-query';
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

export default function Reports() {
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
        title="Reports"
        description="Cost trends and fleet utilization insights"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Fleet Utilization', value: `${summary.fleetUtilization}%` },
          { label: 'Monthly Fuel', value: formatCurrency(summary.monthlyFuelCost) },
          { label: 'Monthly Maintenance', value: formatCurrency(summary.monthlyMaintenanceCost) },
          { label: 'Completed Trips', value: formatNumber(summary.completedTrips) },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusPieChart data={charts.vehicleStatus} title="Fleet Composition by Status" />
        <MonthlyBarChart data={charts.monthlyExpenses} title="Total Expenses by Month" />
        <MonthlyLineChart data={charts.fuelExpenses} title="Fuel Spend Trend" color="#ea580c" />
        <MonthlyBarChart
          data={charts.maintenanceExpenses}
          title="Maintenance Spend Trend"
          color="#64748b"
        />
      </div>
    </div>
  );
}
