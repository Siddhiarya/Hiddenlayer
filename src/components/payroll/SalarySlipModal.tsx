import React from 'react';
import { Printer, Download, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { PayslipRecord } from '../../types/payroll';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';

export interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: PayslipRecord | null;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  payslip,
}) => {
  const { success } = useToast();

  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    success('Payslip Downloaded', `Generated PDF for ${payslip.month} (${payslip.id}.pdf)`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Salary Slip — ${payslip.month}`}
      description="Official monthly compensation breakdown and tax document."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Slip
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
        </>
      }
    >
      {/* Printable Payslip Card */}
      <div id="printable-payslip" className="bg-white p-6 sm:p-8 rounded-2xl border border-surface-200/80 shadow-xs space-y-6 text-surface-800">
        {/* Company Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-surface-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-600 via-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 fill-white/20" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-surface-900">
                DAYFLOW INC.
              </h2>
              <p className="text-xs text-surface-500">
                742 Market Street, Suite 500, San Francisco, CA 94103
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              CONFIRMED & PAID
            </span>
            <p className="text-xs font-mono text-surface-400 mt-1">
              Ref: {payslip.id}
            </p>
          </div>
        </div>

        {/* Employee & Payment Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-50/70 border border-surface-100 text-xs">
          <div>
            <span className="text-surface-400 font-semibold uppercase text-[10px] block">
              Employee Name
            </span>
            <span className="font-bold text-surface-900 text-sm mt-0.5 block">
              {payslip.employeeName}
            </span>
          </div>

          <div>
            <span className="text-surface-400 font-semibold uppercase text-[10px] block">
              Employee ID & Dept
            </span>
            <span className="font-semibold text-surface-800 mt-0.5 block">
              {payslip.employeeId} • {payslip.department}
            </span>
          </div>

          <div>
            <span className="text-surface-400 font-semibold uppercase text-[10px] block">
              Designation
            </span>
            <span className="font-semibold text-surface-800 mt-0.5 block">
              {payslip.jobTitle}
            </span>
          </div>

          <div>
            <span className="text-surface-400 font-semibold uppercase text-[10px] block">
              Payment Date & Method
            </span>
            <span className="font-semibold text-surface-800 mt-0.5 block">
              {formatDate(payslip.paymentDate)} ({payslip.paymentMethod})
            </span>
          </div>
        </div>

        {/* Earnings & Deductions Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="rounded-xl border border-surface-200 overflow-hidden">
            <div className="bg-emerald-50/70 px-4 py-2.5 border-b border-emerald-100 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Earnings (A)
              </span>
              <span className="text-xs font-bold text-emerald-900">Amount</span>
            </div>
            <div className="divide-y divide-surface-100 text-xs">
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-surface-600">Basic Salary</span>
                <span className="font-semibold text-surface-900">{formatCurrency(payslip.basic)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-surface-600">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-surface-900">{formatCurrency(payslip.hra)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-surface-600">Special & Travel Allowances</span>
                <span className="font-semibold text-surface-900">{formatCurrency(payslip.allowances)}</span>
              </div>
              <div className="px-4 py-3 bg-surface-50 flex justify-between font-bold text-surface-900">
                <span>Gross Earnings</span>
                <span>{formatCurrency(payslip.grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="rounded-xl border border-surface-200 overflow-hidden">
            <div className="bg-rose-50/70 px-4 py-2.5 border-b border-rose-100 flex justify-between items-center">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Deductions (B)
              </span>
              <span className="text-xs font-bold text-rose-900">Amount</span>
            </div>
            <div className="divide-y divide-surface-100 text-xs">
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-surface-600">Provident Fund (PF / 401k)</span>
                <span className="font-semibold text-surface-900">{formatCurrency(payslip.pfDeduction)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-surface-600">Income Tax (TDS / Federal)</span>
                <span className="font-semibold text-surface-900">{formatCurrency(payslip.taxDeduction)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-surface-600">Standard Benefit Deductions</span>
                <span className="font-semibold text-surface-900">$0.00</span>
              </div>
              <div className="px-4 py-3 bg-surface-50 flex justify-between font-bold text-surface-900">
                <span>Total Deductions</span>
                <span>{formatCurrency(payslip.totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-primary-100">
              Net Take-Home Salary (A - B)
            </span>
            <h3 className="text-3xl font-extrabold mt-0.5 tracking-tight">
              {formatCurrency(payslip.netSalary)}
            </h3>
            <p className="text-xs text-primary-200 mt-1">
              Disbursed to Account: {payslip.bankAccount}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-white/20 sm:pl-6">
            <span className="text-[11px] text-primary-200 block">
              Authorized Signature
            </span>
            <div className="mt-2 font-serif italic text-lg tracking-wider text-white">
              Sarah Jenkins
            </div>
            <span className="text-[10px] text-primary-300 block">
              Head of HR Operations
            </span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[10px] text-surface-400 text-center leading-relaxed">
          This is a computer-generated payslip generated by Dayflow HRMS and does not require a physical signature for validity.
        </p>
      </div>
    </Modal>
  );
};
