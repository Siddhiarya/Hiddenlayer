import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { PayrollRecord } from '../../../types/employee';
import { 
  Printer, 
  Layers
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollRecord | null;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  payroll
}) => {
  if (!payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Salary Payslip"
      subtitle={`Pay Period: ${payroll.payPeriod}`}
      maxWidth="2xl"
    >
      <div>
        {/* Printable Slip Container */}
        <div id="printable-slip" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold shadow-md shadow-brand-500/20">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dayflow HRMS</h2>
                <p className="text-xs text-slate-500 font-medium">Every workday, perfectly aligned.</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 uppercase tracking-wider">
                Official Pay Statement
              </span>
              <p className="text-xs font-semibold text-slate-600 mt-1">Period: {payroll.payPeriod}</p>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
              <span className="font-bold text-slate-800 text-sm">{payroll.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
              <span className="font-semibold text-slate-800">{payroll.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <span className="font-semibold text-slate-800">{payroll.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation</span>
              <span className="font-semibold text-slate-800">{payroll.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Date</span>
              <span className="font-semibold text-slate-800">{payroll.paymentDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Status</span>
              <div className="mt-0.5">
                <Badge variant={payroll.paymentStatus}>{payroll.paymentStatus}</Badge>
              </div>
            </div>
          </div>

          {/* Detailed Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 pb-1.5 border-b-2 border-emerald-500/20">
                Earnings & Allowances
              </h4>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Basic Salary</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.basicSalary.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">House Rent Allowance (HRA)</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.allowances.hra.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Special Allowance</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.allowances.special.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Medical Allowance</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.allowances.medical.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Conveyance Allowance</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.allowances.conveyance.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold">
                    <td className="py-2.5 px-2 text-emerald-900">Total Gross Earnings</td>
                    <td className="py-2.5 px-2 text-right text-emerald-900">
                      ${payroll.grossSalary.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 pb-1.5 border-b-2 border-rose-500/20">
                Deductions & Taxes
              </h4>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Provident Fund (PF)</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.deductions.pf.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Income Tax (Withholding)</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.deductions.tax.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Health Insurance Premium</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.deductions.insurance.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Other Deductions</td>
                    <td className="py-2 text-right font-semibold text-slate-900">${payroll.deductions.other.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-rose-50/50 font-bold">
                    <td className="py-2.5 px-2 text-rose-900">Total Deductions</td>
                    <td className="py-2.5 px-2 text-right text-rose-900">
                      -${payroll.deductions.total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-5 text-white flex flex-col sm:flex-row items-center justify-between shadow-lg shadow-brand-600/20 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-100">Net Take-Home Salary</p>
              <p className="text-3xl font-extrabold tracking-tight">${payroll.netSalary.toLocaleString()}</p>
              <p className="text-[11px] text-brand-100/90 mt-1">Disbursed to: {payroll.bankAccount}</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs text-xs text-center border border-white/20">
              <span className="block text-[10px] text-brand-200 uppercase">Tax Identifier</span>
              <span className="font-mono font-semibold">{payroll.taxNumber}</span>
            </div>
          </div>

          {/* Footer disclaimer */}
          <div className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400">
            This is a system-generated pay slip created by Dayflow HRMS. No physical signature is required.
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Employee Payroll is strictly <strong className="text-slate-700 font-semibold">read-only</strong>.
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
