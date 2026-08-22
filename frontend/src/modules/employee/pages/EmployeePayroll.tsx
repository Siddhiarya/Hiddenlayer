import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { employeeApi } from '../services/employeeApi';
import { PayrollRecord, SalaryBreakdown } from '../../../types/employee';
import { SalarySlipModal } from '../components/SalarySlipModal';
import { Badge } from '../../../components/common/Badge';
import { LoadingSkeleton } from '../../../components/common/LoadingSkeleton';
import { 
  CreditCard, 
  Lock, 
  Eye, 
  TrendingUp
} from 'lucide-react';

export const EmployeePayroll: React.FC = () => {
  const { user } = useAuth();
  const [salaryStructure, setSalaryStructure] = useState<SalaryBreakdown | null>(null);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    const fetchPayrollData = async () => {
      setIsLoading(true);
      try {
        const res = await employeeApi.getPayroll();
        if (res.success && res.data) {
          setSalaryStructure(res.data.salaryStructure);
          setPayrolls(res.data.payrolls);
        } else if (user?.salary) {
          setSalaryStructure(user.salary);
        }
      } catch (err) {
        console.error('Failed to load payroll data:', err);
        if (user?.salary) setSalaryStructure(user.salary);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollData();
  }, [user]);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const s = salaryStructure || user?.salary;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Read-Only Security Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
            <CreditCard className="h-4 w-4" />
            <span>Compensation & Payroll Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Salary & Compensation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Review your approved compensation structure, monthly disbursements, and download official monthly pay slips.
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-2xl bg-amber-50 border border-amber-200/80 px-4 py-2.5 text-xs text-amber-800 font-semibold">
          <Lock className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Read-Only Portal (Admin Protected)</span>
        </div>
      </div>

      {/* Salary Overview Card Breakdown */}
      {s && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings / Allowances Breakdown */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Gross Earnings</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +${((s.basic || 0) + (s.allowances?.total || 0)).toLocaleString()} / mo
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Basic Salary</span>
                <span className="font-semibold text-slate-800">${s.basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-slate-800">${s.allowances.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Special Allowance</span>
                <span className="font-semibold text-slate-800">${s.allowances.special.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Medical Allowance</span>
                <span className="font-semibold text-slate-800">${s.allowances.medical.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Conveyance Allowance</span>
                <span className="font-semibold text-slate-800">${s.allowances.conveyance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Monthly Deductions</h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                -${s.deductions.total.toLocaleString()} / mo
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Provident Fund (PF)</span>
                <span className="font-semibold text-slate-800">${s.deductions.pf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Income Tax (Withholding)</span>
                <span className="font-semibold text-slate-800">${s.deductions.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Health Insurance Premium</span>
                <span className="font-semibold text-slate-800">${s.deductions.insurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Other Deductions</span>
                <span className="font-semibold text-slate-800">${s.deductions.other.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Spotlight Card */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 via-indigo-800 to-slate-900 p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>Net Compensation</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight mt-2 text-white">
                ${s.netSalary.toLocaleString()}
              </p>
              <p className="text-xs text-brand-100/80 mt-1">Calculated monthly net disbursement</p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 space-y-2 text-xs text-brand-100">
              <div className="flex justify-between">
                <span>Employee:</span>
                <span className="font-semibold text-white">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Employee ID:</span>
                <span className="font-mono text-white">{user?.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Deposit:</span>
                <span className="font-semibold text-emerald-300">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Pay Slips Table */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Salary Slip Statements</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click "View Slip" to open and print your official salary breakdown.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {payrolls.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Pay Period</th>
                  <th className="py-3 px-4">Disbursement Date</th>
                  <th className="py-3 px-4">Gross Salary</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.payPeriod}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {p.paymentDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      ${p.grossSalary.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">
                      -${p.deductions.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                      ${p.netSalary.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.paymentStatus}>{p.paymentStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSlip(p)}
                        className="inline-flex items-center space-x-1.5 rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No previous payslips generated yet.
            </div>
          )}
        </div>
      </div>

      {/* Salary Slip Modal */}
      {selectedSlip && (
        <SalarySlipModal
          isOpen={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          payroll={selectedSlip}
        />
      )}
    </div>
  );
};
