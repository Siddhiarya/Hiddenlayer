import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CheckInCard } from '../../components/attendance/CheckInCard';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';
import { formatCurrency } from '../../utils/formatters';
import { getGreeting } from '../../utils/dateUtils';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    getEmployeeLeaveBalance,
    getUserLeaveRequests,
    getEmployeeAttendance,
    getEmployeePayslips,
  } = useData();
  const navigate = useNavigate();

  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);

  const empId = user?.employeeId || 'DF-1001';
  const balance = getEmployeeLeaveBalance(empId);
  const userLeaves = getUserLeaveRequests(empId);
  const userAttendance = getEmployeeAttendance(empId);
  const userPayslips = getEmployeePayslips(empId);

  const pendingLeaves = userLeaves.filter(l => l.status === 'Pending').length;
  const latestPayslip = userPayslips[0];

  // Weekly attendance chart data
  const weeklyData = [
    { day: 'Mon', hours: 8.5, status: 'Present' },
    { day: 'Tue', hours: 8.2, status: 'Present' },
    { day: 'Wed', hours: 8.0, status: 'Present' },
    { day: 'Thu', hours: 4.0, status: 'Half Day' },
    { day: 'Fri', hours: 8.5, status: 'Present' },
    { day: 'Sat', hours: 0, status: 'Weekend' },
    { day: 'Sun', hours: 0, status: 'Weekend' },
  ];

  // Recent timeline activities
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Checked in for workday',
      time: 'Today at 09:12 AM',
      type: 'attendance',
      icon: Clock,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 'act-2',
      title: 'Submitted Paid Leave application (3 days)',
      time: 'Yesterday at 04:30 PM',
      type: 'leave',
      icon: Calendar,
      color: 'text-indigo-500 bg-indigo-50',
    },
    {
      id: 'act-3',
      title: 'September 2026 Salary Slip Generated',
      time: 'Sep 30, 2026',
      type: 'payroll',
      icon: CreditCard,
      color: 'text-primary-500 bg-primary-50',
    },
    {
      id: 'act-4',
      title: 'Sick Leave request approved by Sarah Jenkins',
      time: 'Sep 02, 2026',
      type: 'leave',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight flex items-center gap-2">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Alex'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Here’s your workday overview and self-service portal.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsApplyLeaveOpen(true)}
          >
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Primary Interactive Check-In Card */}
      <CheckInCard />

      {/* Top 4 Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Present Days (Month)"
          value="21 Days"
          subtitle="95.5% attendance rate"
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: '+2.4%', isPositive: true }}
          colorScheme="emerald"
          onClick={() => navigate('/employee/attendance')}
        />

        <StatCard
          title="Leave Balance"
          value={`${balance.paid.remaining + balance.sick.remaining} Days`}
          subtitle={`Paid: ${balance.paid.remaining} • Sick: ${balance.sick.remaining}`}
          icon={<Calendar className="w-5 h-5" />}
          colorScheme="indigo"
          onClick={() => navigate('/employee/leave')}
        />

        <StatCard
          title="Upcoming Net Pay"
          value={latestPayslip ? formatCurrency(latestPayslip.netSalary) : '$9,550'}
          subtitle="Next disbursal: Oct 31, 2026"
          icon={<CreditCard className="w-5 h-5" />}
          colorScheme="primary"
          onClick={() => navigate('/employee/payroll')}
        />

        <StatCard
          title="Pending Requests"
          value={pendingLeaves}
          subtitle={pendingLeaves > 0 ? 'Awaiting Manager review' : 'All requests processed'}
          icon={<AlertCircle className="w-5 h-5" />}
          colorScheme={pendingLeaves > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/employee/leave')}
        />
      </div>

      {/* Middle Section: Weekly Attendance Chart & Profile Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Weekly Working Hours
              </h3>
              <p className="text-xs text-surface-500">
                Logged daily hours for the current week (Target: 40 hrs)
              </p>
            </div>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
              37.2 / 40.0 hrs
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                          <p className="font-bold">{data.day}: {data.hours} hours</p>
                          <p className="text-slate-300">Status: {data.status}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.hours >= 8
                          ? '#6366f1'
                          : entry.hours > 0
                          ? '#f59e0b'
                          : '#e2e8f0'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-surface-500 border-t border-surface-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-primary-500" />
              <span>Full Day (≥ 8h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>Half Day (&lt; 8h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-surface-200" />
              <span>Off / Weekend</span>
            </div>
          </div>
        </div>

        {/* Quick Profile Summary Card */}
        <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-surface-100">
              <h3 className="text-base font-bold text-surface-900">
                Employee Profile
              </h3>
              <Badge variant="active" size="sm">
                Active
              </Badge>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">Employee ID:</span>
                <span className="font-mono font-bold text-surface-900">{user?.employeeId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">Department:</span>
                <span className="font-semibold text-surface-900">{user?.department}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">Designation:</span>
                <span className="font-semibold text-surface-900">{user?.jobTitle}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">Reporting Manager:</span>
                <span className="font-semibold text-surface-900">Sarah Jenkins</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">Profile Completion:</span>
                <span className="font-bold text-emerald-600">100% Complete</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-surface-700">Verified Documents</span>
              <span className="text-[11px] font-bold text-emerald-600">4 / 4 Attached</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/employee/profile')}
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Timeline */}
      <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-surface-900">
              Recent Activity & Updates
            </h3>
            <p className="text-xs text-surface-500">
              Audit log of your recent interactions and system notifications.
            </p>
          </div>
        </div>

        <div className="divide-y divide-surface-100">
          {recentActivities.map(act => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-surface-900 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-surface-500 mt-0.5">
                      {act.time}
                    </p>
                  </div>
                </div>
                <Badge variant="neutral" size="sm">
                  {act.type}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
      />
    </div>
  );
};
