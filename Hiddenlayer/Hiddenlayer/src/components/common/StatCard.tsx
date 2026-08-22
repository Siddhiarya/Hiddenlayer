import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  colorScheme?: 'primary' | 'emerald' | 'amber' | 'indigo' | 'purple' | 'rose' | 'sky' | 'neutral';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'primary',
  className,
  onClick,
}) => {
  const schemeStyles: Record<string, { iconBg: string; glow: string }> = {
    primary: {
      iconBg: 'bg-primary-50 text-primary-600 border-primary-100',
      glow: 'hover:border-primary-300',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      glow: 'hover:border-emerald-300',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      glow: 'hover:border-amber-300',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      glow: 'hover:border-indigo-300',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      glow: 'hover:border-purple-300',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      glow: 'hover:border-rose-300',
    },
    sky: {
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      glow: 'hover:border-sky-300',
    },
    neutral: {
      iconBg: 'bg-surface-100 text-surface-600 border-surface-200',
      glow: 'hover:border-surface-300',
    },
  };

  const scheme = schemeStyles[colorScheme] || schemeStyles.primary;

  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'relative p-5 rounded-2xl bg-white border border-surface-200/80 shadow-xs hover:shadow-card-hover transition-all duration-300 group',
          scheme.glow,
          onClick && 'cursor-pointer',
          className
        )
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
          {title}
        </span>
        <div
          className={twMerge(
            clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105',
              scheme.iconBg
            )
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold text-surface-900 tracking-tight">
          {value}
        </h3>

        <div className="flex items-center gap-2 mt-1.5">
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md',
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'bg-rose-50 text-rose-700 font-semibold'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend.value}
            </span>
          )}
          {(trend?.label || subtitle) && (
            <span className="text-xs text-surface-500 truncate">
              {trend?.label || subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
