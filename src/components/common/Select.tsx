import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-surface-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              'w-full appearance-none px-3.5 py-2.5 bg-white border rounded-xl text-sm text-surface-900 pr-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer',
              error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-surface-200 hover:border-surface-300',
              className
            )
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 text-surface-400 pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-rose-500 font-medium animate-fadeIn">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-surface-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
