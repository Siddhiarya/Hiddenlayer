import React from 'react';

type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral'
  | 'Present'
  | 'Absent'
  | 'Half-day'
  | 'Leave'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'Processing';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'md'
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'Approved':
      case 'Present':
      case 'Paid':
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10';
      
      case 'Pending':
      case 'Half-day':
      case 'Processing':
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10';
      
      case 'Rejected':
      case 'Absent':
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10';
      
      case 'Leave':
      case 'info':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/10';
      
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset ${sizeClass} ${getStyles()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {children}
    </span>
  );
};
