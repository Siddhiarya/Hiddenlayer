import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SalarySlipModal } from '../../components/payroll/SalarySlipModal';
import { PayslipRecord } from '../../types/payroll';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';

export const EmployeePayroll: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeePayslips, getEmployeeById } = useData();

  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);

  const empId = user?.employeeId || 'DF-1001';
  const payslips = getEmployeePayslips(empId);
  const employee = user ? getEmployeeById(empId) : null;

  const currentSalary = employee?.salary || {
    basic: 6500,
    hra: 2600,
    allowances: 1400,
    deductions: 950,
  };

  const grossSalary = currentSalary.basic + currentSalary.hra + currentSalary.allowances;
  const netSalary = Math.max(0, grossSalary - currentSalary.deductions);

  // Pie chart dataset
  const breakdownData = [
    { name: 'Basic Pay', value: currentSalary.basic, color: '#6366f1' },
    { name: 'House Rent (HRA)', value: currentSalary.hra, color: '#8b5cf6' },
    { name: 'Special Allowances', value: currentSalary.allowances, color: '#38bdf8' },
    { name: 'Total Deductions', value: currentSalary.deductions, color: '#f43f5e' },
  ];

  const columns: Column<PayslipRecord>[] = [
    {
      header: 'Payroll Month',
      accessor: 'month',
      render: row => (
        <div className="flex items-center gap-2 font-bold text-surface-900">
          <FileText className="w-4 h-4 text-primary-600" />
          <span>{row.month}</span>
        </div>
      ),
    },
    {
      header: 'Gross Salary',
      accessor: 'grossSalary',
      render: row => (
        <span className="font-semibold text-surface-800">
          {formatCurrency(row.grossSalary)}
        </span>
      ),
    },
    {
      header: 'Total Deductions',
      accessor: 'totalDeductions',
      render: row => (
        <span className="font-semibold text-rose-600">
          - {formatCurrency(row.totalDeductions)}
        </span>
      ),
    },
    {
      header: 'Net Take-Home',
      accessor: 'netSalary',
      render: row => (
        <span className="font-bold text-emerald-600 text-sm">
          {formatCurrency(row.netSalary)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: row => (
        <Badge variant="paid" size="sm" dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Payment Date',
      accessor: 'paymentDate',
      render: row => (
        <span className="text-xs text-surface-500">{formatDate(row.paymentDate)}</span>
      ),
    },
    {
      header: 'Payslip',
      render: row => (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<FileText className="w-3.5 h-3.5" />}
          onClick={() => setSelectedPayslip(row)}
        >
          View Slip
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            My Payroll & Compensation
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Access your monthly salary breakdown, tax deductions, and official payslips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400 bg-surface-100 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Read-Only Access
          </span>
        </div>
      </div>

      {/* Top Salary Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Monthly CTC"
          value={formatCurrency(grossSalary)}
          subtitle="Fixed monthly earnings"
          icon={<DollarSign className="w-5 h-5" />}
          colorScheme="primary"
        />

        <StatCard
          title="Net Take-Home Pay"
          value={formatCurrency(netSalary)}
          subtitle="Credited to bank account"
          icon={<CreditCard className="w-5 h-5" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Total Deductions"
          value={formatCurrency(currentSalary.deductions)}
          subtitle="PF & Income Tax TDS"
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="rose"
        />

        <StatCard
          title="Disbursal Schedule"
          value="Last Day"
          subtitle="Direct ACH deposit"
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="indigo"
        />
      </div>

      {/* Visual Chart Breakdown & Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salary Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Monthly Salary Structure Breakdown
              </h3>
              <p className="text-xs text-surface-500">
                Visual proportion of basic pay, HRA allowances, and withholdings
              </p>
            </div>
            <Badge variant="active" size="sm">
              Current Cycle
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown legend list */}
            <div className="space-y-2.5">
              {breakdownData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 border border-surface-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-surface-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-surface-900">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banking and Tax Verification Card */}
        <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <h3 className="text-base font-bold text-surface-900">
                Disbursement Account
              </h3>
              <Badge variant="active" size="sm">
                Verified
              </Badge>
            </div>

            <div className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-surface-500">Bank Name:</span>
                <span className="font-bold text-surface-900">Silicon Valley Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Account Number:</span>
                <span className="font-mono font-bold text-surface-900">•••• •••• •••• 8842</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Account Type:</span>
                <span className="font-semibold text-surface-900">Checking / ACH Direct</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Tax Form:</span>
                <span className="font-bold text-emerald-600">W-4 On File</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-primary-50/60 border border-primary-100 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary-900">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              <span>Direct Deposit Active</span>
            </div>
            <p className="text-[11px] text-primary-700 leading-relaxed">
              Your next paycheck of {formatCurrency(netSalary)} will be disbursed automatically on Oct 31, 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Salary History Data Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-surface-900">
          Historical Salary Slips
        </h3>
        <DataTable
          data={payslips}
          columns={columns}
          searchPlaceholder="Search month or slip ID..."
          emptyTitle="No historical payslips"
          emptyDescription="You do not have any generated salary slips in this period."
          pageSize={6}
        />
      </div>

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        payslip={selectedPayslip}
      />
    </div>
  );
};
