import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Progress bar
export function ProgressBar({
  value,
  className,
  size = 'md',
  color,
}: {
  value: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      className={clsx(
        'w-full bg-slate-100 rounded-full overflow-hidden',
        size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2',
        className
      )}
    >
      <div
        className={clsx(
          'h-full rounded-full transition-all duration-500 ease-out',
          color || (clamped >= 75 ? 'bg-emerald-500' : clamped >= 45 ? 'bg-blue-600' : 'bg-amber-500')
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

// Badge
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'outline' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full tracking-wide',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs',
        {
          'bg-slate-100 text-slate-700 border border-slate-200': variant === 'default',
          'bg-blue-50 text-blue-700 border border-blue-200': variant === 'brand',
          'bg-emerald-50 text-emerald-700 border border-emerald-200': variant === 'success',
          'bg-amber-50 text-amber-700 border border-amber-200': variant === 'warning',
          'bg-rose-50 text-rose-700 border border-rose-200': variant === 'danger',
          'bg-purple-50 text-purple-700 border border-purple-200': variant === 'purple',
          'border border-slate-300 text-slate-600 bg-white': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

// Card
export function Card({
  children,
  className,
  onClick,
  hoverable = true,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white border border-slate-200/90 rounded-2xl p-5 shadow-subtle transition-all duration-200',
        onClick && 'cursor-pointer',
        hoverable && onClick && 'hover:border-blue-400 hover:shadow-card hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}

// Empty State
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

// Skeleton loader
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-slate-200 rounded-lg', className)} />;
}

// Loading State
export function LoadingState({
  message = 'Loading details...',
  rows = 3,
}: {
  message?: string;
  rows?: number;
}) {
  return (
    <div className="py-8 px-2 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-600">{message}</span>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

// Contextual Error State
export function ErrorState({
  title = 'Unable to load content',
  message,
  onRetry,
  compact = false,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 text-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{message || title}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded bg-white border border-rose-200"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-slate-200 rounded-2xl shadow-subtle">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">
        {message || 'A temporary connection error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-subtle"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
}

// Modal
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-elevated border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Circular Readiness Gauge
export function ReadinessGauge({
  percentage,
  size = 64,
  strokeWidth = 6,
  label = 'READY',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75 ? '#10B981' : clamped >= 45 ? '#2563EB' : '#F59E0B';

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-900 leading-none">
            {clamped}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
          {label}
        </span>
      )}
    </div>
  );
}
