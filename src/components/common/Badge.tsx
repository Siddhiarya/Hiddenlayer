import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'present'
    | 'absent'
    | 'halfday'
    | 'leave'
    | 'active'
    | 'probation'
    | 'terminated'
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'paid'
    | 'admin'
    | 'hr'
    | 'employee'
    | 'neutral'
    | 'primary';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
}) => {
  const variantStyles: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
    present: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80', dotColor: 'bg-emerald-500' },
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80', dotColor: 'bg-emerald-500' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80', dotColor: 'bg-emerald-500' },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80', dotColor: 'bg-emerald-500' },

    absent: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/80', dotColor: 'bg-rose-500' },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/80', dotColor: 'bg-rose-500' },
    terminated: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/80', dotColor: 'bg-rose-500' },

    halfday: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80', dotColor: 'bg-amber-500' },
    probation: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80', dotColor: 'bg-amber-500' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80', dotColor: 'bg-amber-500' },

    leave: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/80', dotColor: 'bg-indigo-500' },
    admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/80', dotColor: 'bg-purple-500' },
    hr: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/80', dotColor: 'bg-blue-500' },
    employee: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dotColor: 'bg-slate-500' },
    neutral: { bg: 'bg-surface-100', text: 'text-surface-700', border: 'border-surface-200', dotColor: 'bg-surface-400' },
    primary: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', dotColor: 'bg-primary-500' },
  };

  const style = variantStyles[variant.toLowerCase()] || variantStyles.neutral;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors select-none',
          style.bg,
          style.text,
          style.border,
          sizeClass,
          className
        )
      )}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotColor}`} />}
      {children}
    </span>
  );
};
