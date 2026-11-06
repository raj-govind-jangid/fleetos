import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-primary-50 text-primary-700 ring-primary-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-800 ring-amber-100',
  danger: 'bg-red-50 text-red-700 ring-red-100',
  info: 'bg-sky-50 text-sky-700 ring-sky-100',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadgeVariant(status?: string | null): BadgeVariant {
  if (!status) return 'neutral';
  const s = status.toUpperCase();
  if (['ACTIVE', 'VALID', 'COMPLETED', 'STARTED'].includes(s)) return 'success';
  if (['WARNING', 'EXPIRING_SOON', 'SCHEDULED', 'ASSIGNED', 'ON_LEAVE', 'MAINTENANCE'].includes(s))
    return 'warning';
  if (['CRITICAL', 'EXPIRED', 'CANCELLED', 'TERMINATED', 'SOLD', 'INACTIVE', 'SUSPENDED'].includes(s))
    return 'danger';
  if (['INFO', 'PLANNED', 'IN_PROGRESS'].includes(s)) return 'info';
  return 'neutral';
}
