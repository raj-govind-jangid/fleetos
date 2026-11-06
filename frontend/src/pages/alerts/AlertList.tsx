import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, RefreshCw } from 'lucide-react';
import * as alertService from '../../services/alert.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Select } from '../../components/common/Select';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

export default function AlertList() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');
  const [readFilter, setReadFilter] = useState('');

  const params = useMemo(
    () => ({
      page,
      limit: 15,
      severity: severity || undefined,
      isRead: readFilter === '' ? undefined : readFilter === 'true',
    }),
    [page, severity, readFilter]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertService.listAlerts(params),
  });

  const markReadMutation = useMutation({
    mutationFn: alertService.markAlertRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['alerts'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: alertService.markAllAlertsRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['alerts'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: alertService.generateAlerts,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['alerts'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Compliance and operational notifications"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              loading={generateMutation.isPending}
              onClick={async () => {
                try {
                  await generateMutation.mutateAsync();
                  toast.success('Alerts generated');
                } catch (err) {
                  toast.error(getErrorMessage(err));
                }
              }}
            >
              Generate
            </Button>
            <Button
              variant="secondary"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              loading={markAllMutation.isPending}
              onClick={async () => {
                try {
                  await markAllMutation.mutateAsync();
                  toast.success('All alerts marked as read');
                } catch (err) {
                  toast.error(getErrorMessage(err));
                }
              }}
            >
              Mark all read
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <Select
          options={[
            { label: 'INFO', value: 'INFO' },
            { label: 'WARNING', value: 'WARNING' },
            { label: 'CRITICAL', value: 'CRITICAL' },
          ]}
          placeholder="All severities"
          value={severity}
          onChange={(e) => {
            setSeverity(e.target.value);
            setPage(1);
          }}
          className="sm:w-44 sm:shrink-0"
        />
        <Select
          options={[
            { label: 'Unread', value: 'false' },
            { label: 'Read', value: 'true' },
          ]}
          placeholder="All alerts"
          value={readFilter}
          onChange={(e) => {
            setReadFilter(e.target.value);
            setPage(1);
          }}
          className="sm:w-44 sm:shrink-0"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No alerts" description="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {data.data.map((alert) => (
            <div
              key={alert._id}
              className={cn(
                'rounded-xl border bg-white p-4',
                alert.isRead ? 'border-slate-200' : 'border-primary-200 bg-primary-50/30'
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
                    <Badge variant={statusBadgeVariant(alert.severity)}>{alert.severity}</Badge>
                    <Badge variant="neutral">{alert.type.replaceAll('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{alert.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {alert.entityType} · {formatDate(alert.createdAt, true)}
                  </p>
                </div>
                {!alert.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={markReadMutation.isPending}
                    onClick={async () => {
                      try {
                        await markReadMutation.mutateAsync(alert._id);
                      } catch (err) {
                        toast.error(getErrorMessage(err));
                      }
                    }}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
