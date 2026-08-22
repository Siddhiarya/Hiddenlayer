import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CreditCard,
  Users,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { exportToCSV } from '../../utils/exportUtils';
import { formatCurrency } from '../../utils/formatters';

export const AdminReports: React.FC = () => {
  const { employees, attendanceRecords, leaveRequests } = useData();
  const { success } = useToast();

  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');

  // Chart datasets
  const leaveUtilizationData = [
    { department: 'Engineering', paid: 12, sick: 5, casual: 2 },
    { department: 'Design', paid: 6, sick: 2, casual: 1 },
    { department: 'HR', paid: 4, sick: 1, casual: 2 },
    { department: 'Finance', paid: 5, sick: 3, casual: 0 },
    { department: 'Marketing', paid: 7, sick: 2, casual: 1 },
    { department: 'Sales', paid: 9, sick: 4, casual: 3 },
  ];

  const payrollTrendData = [
    { month: 'Jun', total: 135000, engineering: 48000, sales: 28000, other: 59000 },
    { month: 'Jul', total: 138000, engineering: 50000, sales: 29000, other: 59000 },
    { month: 'Aug', total: 140500, engineering: 51500, sales: 29500, other: 59500 },
    { month: 'Sep', total: 142500, engineering: 53000, sales: 30000, other: 59500 },
    { month: 'Oct', total: 144200, engineering: 54000, sales: 30500, other: 59700 },
  ];

  const handleExportAttendanceReport = () => {
    exportToCSV('Dayflow_Attendance_Report_Q4.csv', attendanceRecords);
    success('Report Exported', 'Attendance report CSV exported.');
  };

  const handleExportLeaveReport = () => {
    exportToCSV('Dayflow_Leave_Utilization_Report.csv', leaveRequests);
    success('Report Exported', 'Leave utilization report exported.');
  };

  const handleExportPayrollReport = () => {
    const data = employees.map(e => ({
      'Employee ID': e.employeeId,
      'Name': e.name,
      'Department': e.department,
      'Annual Gross CTC': (e.salary.basic + e.salary.hra + e.salary.allowances) * 12,
    }));
    exportToCSV('Dayflow_Annual_Payroll_Expenditure.csv', data);
    success('Report Exported', 'Payroll expenditure report exported.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Reports & Organizational Analytics
            </h1>
            <Badge variant="admin" size="sm">
              BI Intelligence
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Data insights on company-wide attendance punctuality, time-off trends, and payroll budgets.
          </p>
        </div>

        {/* Date Range Selector & Print */}
        <div className="flex items-center gap-2.5">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-2 text-surface-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="month">This Month (October 2026)</option>
            <option value="quarter">This Quarter (Q4 2026)</option>
            <option value="year">Year to Date (2026)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>

      {/* 4 Report Quick-Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <Badge variant="active" size="sm">Monthly</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">Attendance Report</h3>
            <p className="text-xs text-surface-500 mt-1">
              Daily logs, tardiness, and overtime statistics.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportAttendanceReport}
          >
            Export Attendance
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <Badge variant="leave" size="sm">Quarterly</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">Leave Utilization</h3>
            <p className="text-xs text-surface-500 mt-1">
              Paid vs Sick days breakdown by department.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportLeaveReport}
          >
            Export Leaves
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <Badge variant="admin" size="sm">Financial</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">Payroll Expenditure</h3>
            <p className="text-xs text-surface-500 mt-1">
              Gross compensation, taxes, and net disbursements.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportPayrollReport}
          >
            Export Payroll
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <Badge variant="neutral" size="sm">Demographics</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">Headcount Growth</h3>
            <p className="text-xs text-surface-500 mt-1">
              New hires, probation conversions, and retention.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportAttendanceReport}
          >
            Export Headcount
          </Button>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Utilization by Department */}
        <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Leave Utilization by Department
              </h3>
              <p className="text-xs text-surface-500">
                Number of days taken by category across departments
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="paid" fill="#6366f1" name="Paid Vacation" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sick" fill="#f43f5e" name="Sick Leave" radius={[4, 4, 0, 0]} />
                <Bar dataKey="casual" fill="#f59e0b" name="Casual / Other" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Payroll Expenditure Trends */}
        <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Monthly Total Payroll Budget (Past 5 Months)
              </h3>
              <p className="text-xs text-surface-500">
                Disbursement trends and departmental allocation
              </p>
            </div>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
              +6.8% YoY
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payrollTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  domain={[120000, 160000]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${v / 1000}k`}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v: any) => [formatCurrency(Number(v)), 'Total Disbursed']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#payrollGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
