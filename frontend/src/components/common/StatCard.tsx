import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-brand-600',
  trend,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center text-xs">
              <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                {trend.value}
              </span>
              {trend.label && (
                <span className="ml-1.5 text-slate-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconColor} shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
