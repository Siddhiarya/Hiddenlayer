import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calculator, Check, AlertCircle } from 'lucide-react';
import { Employee } from '../../types/employee';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatters';

export interface SalaryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (
    employeeId: string,
    salary: { basic: number; hra: number; allowances: number; deductions: number }
  ) => void;
}

export const SalaryEditModal: React.FC<SalaryEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
}) => {
  const [basic, setBasic] = useState<number>(0);
  const [hra, setHra] = useState<number>(0);
  const [allowances, setAllowances] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setBasic(employee.salary.basic || 0);
      setHra(employee.salary.hra || 0);
      setAllowances(employee.salary.allowances || 0);
      setDeductions(employee.salary.deductions || 0);
      setError('');
    }
  }, [employee]);

  if (!employee) return null;

  const grossSalary = basic + hra + allowances;
  const netSalary = Math.max(0, grossSalary - deductions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (basic <= 0) {
      setError('Basic salary must be greater than 0.');
      return;
    }
    if (deductions > grossSalary) {
      setError('Deductions cannot exceed gross earnings.');
      return;
    }

    onSave(employee.employeeId, {
      basic,
      hra,
      allowances,
      deductions,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Salary Structure"
      description={`Update compensation package for ${employee.name} (${employee.employeeId})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Basic Salary ($/mo)"
            type="number"
            min={0}
            step={50}
            value={basic}
            onChange={e => setBasic(Number(e.target.value) || 0)}
            required
          />

          <Input
            label="HRA ($/mo)"
            type="number"
            min={0}
            step={50}
            value={hra}
            onChange={e => setHra(Number(e.target.value) || 0)}
            required
          />

          <Input
            label="Special Allowances ($/mo)"
            type="number"
            min={0}
            step={50}
            value={allowances}
            onChange={e => setAllowances(Number(e.target.value) || 0)}
            required
          />

          <Input
            label="Total Deductions ($/mo)"
            type="number"
            min={0}
            step={50}
            value={deductions}
            onChange={e => setDeductions(Number(e.target.value) || 0)}
            required
          />
        </div>

        {/* Realtime Calculated Breakdown Card */}
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-surface-600 pb-2 border-b border-surface-200/60">
            <span className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-primary-600" />
              Real-time Salary Computation
            </span>
            <span className="text-[11px] text-surface-400">Monthly</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-surface-500">Gross Monthly:</span>
              <p className="text-base font-bold text-surface-900">
                {formatCurrency(grossSalary)}
              </p>
            </div>
            <div>
              <span className="text-surface-500">Net Take-Home:</span>
              <p className="text-base font-bold text-emerald-600">
                {formatCurrency(netSalary)}
              </p>
            </div>
          </div>

          {/* Visual Bar Breakdown */}
          <div className="space-y-1 pt-1">
            <div className="h-2 w-full bg-surface-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(basic / (grossSalary || 1)) * 100}%` }}
                className="bg-primary-500"
                title="Basic"
              />
              <div
                style={{ width: `${(hra / (grossSalary || 1)) * 100}%` }}
                className="bg-brand-500"
                title="HRA"
              />
              <div
                style={{ width: `${(allowances / (grossSalary || 1)) * 100}%` }}
                className="bg-sky-400"
                title="Allowances"
              />
            </div>
            <div className="flex justify-between text-[10px] text-surface-500 pt-0.5">
              <span>Basic ({Math.round((basic / (grossSalary || 1)) * 100)}%)</span>
              <span>HRA ({Math.round((hra / (grossSalary || 1)) * 100)}%)</span>
              <span>Allowances ({Math.round((allowances / (grossSalary || 1)) * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" leftIcon={<Check className="w-4 h-4" />}>
            Save Structure
          </Button>
        </div>
      </form>
    </Modal>
  );
};
