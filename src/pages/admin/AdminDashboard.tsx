import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Calendar,
  CreditCard,
  UserPlus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { AddEmployeeModal } from '../../components/employees/AddEmployeeModal';
import { LeaveApprovalModal } from '../../components/leave/LeaveApprovalModal';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { LeaveRequest } from '../../types/leave';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    employees,
    leaveRequests,
    getDailyAttendanceSummary,
    approveLeave,
    rejectLeave,
  } = useData();
  const navigate = useNavigate();

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedReviewLeave, setSelectedReviewLeave] = useState<LeaveRequest | null>(null);

  const attendanceSummary = getDailyAttendanceSummary();
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');

  // Total payroll computation
  const totalPayroll = employees.reduce((acc, emp) => {
    const gross = emp.salary.basic + emp.salary.hra + emp.salary.allowances;
    const net = Math.max(0, gross - emp.salary.deductions);
    return acc + net;
  }, 0);

  // Attendance Trend Area Chart Data
  const attendanceTrendData = [
    { day: 'Mon', present: 19, onLeave: 1, absent: 0 },
    { day: 'Tue', present: 18, onLeave: 1, absent: 1 },
    { day: 'Wed', present: 20, onLeave: 0, absent: 0 },
    { day: 'Thu', present: 17, onLeave: 2, absent: 1 },
    { day: 'Fri', present: 18, onLeave: 1, absent: 1 },
  ];

  // Department distribution
  const deptCounts: Record<string, number> = {};
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  const departmentData = [
    { name: 'Engineering', value: deptCounts['Engineering'] || 6, color: '#6366f1' },
    { name: 'Design', value: deptCounts['Design'] || 3, color: '#ec4899' },
    { name: 'HR', value: deptCounts['HR'] || 3, color: '#8b5cf6' },
    { name: 'Finance', value: deptCounts['Finance'] || 3, color: '#10b981' },
    { name: 'Marketing', value: deptCounts['Marketing'] || 2, color: '#f59e0b' },
    { name: 'Sales', value: deptCounts['Sales'] || 3, color: '#38bdf8' },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <Badge variant="admin" size="sm">
              Executive Console
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Enterprise overview of <strong>{employees.length} employees</strong> across 6 departments.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddEmployeeOpen(true)}
          >
            + Add Employee
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={() => navigate('/admin/leaves')}
          >
            Review Leaves ({pendingLeaves.length})
          </Button>
        </div>
      </div>

      {/* Top High-level KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Headcount"
          value={employees.length}
          subtitle="All active org members"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: '+8.3%', isPositive: true, label: 'this quarter' }}
          colorScheme="primary"
          onClick={() => navigate('/admin/employees')}
        />

        <StatCard
          title="Present Today"
          value={`${attendanceSummary.present} / ${employees.length}`}
          subtitle={`${Math.round((attendanceSummary.present / (employees.length || 1)) * 100)}% attendance rate`}
          icon={<Clock className="w-5 h-5" />}
          colorScheme="emerald"
          onClick={() => navigate('/admin/attendance')}
        />

        <StatCard
          title="On Leave Today"
          value={attendanceSummary.onLeave}
          subtitle="Approved planned leaves"
          icon={<Calendar className="w-5 h-5" />}
          colorScheme="indigo"
          onClick={() => navigate('/admin/leaves')}
        />

        <StatCard
          title="Pending Approvals"
          value={pendingLeaves.length}
          subtitle={pendingLeaves.length > 0 ? 'Requires your review' : 'All clear'}
          icon={<AlertCircle className="w-5 h-5" />}
          colorScheme={pendingLeaves.length > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/admin/leaves')}
        />
      </div>

      {/* Charts Section: Attendance Trends & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-surface-900">
                Company Attendance Trends (This Week)
              </h3>
              <p className="text-xs text-surface-500">
                Daily present headcount vs planned time-off
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              92.4% Avg Punctuality
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 22]} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#presentGrad)"
                  name="Present Count"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Donut Chart */}
        <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <h3 className="text-base font-bold text-surface-900">
                Department Distribution
              </h3>
              <span className="text-xs text-surface-400 font-medium">Headcount</span>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
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
          </div>

          {/* Mini Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {departmentData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-surface-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Approval Queue */}
      <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-surface-900">
              Urgent Leave Approvals Queue
            </h3>
            <p className="text-xs text-surface-500">
              Review and decision employee time-off requests.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/leaves')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View All ({leaveRequests.length})
          </Button>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="p-8 text-center bg-surface-50/50 rounded-2xl border border-dashed border-surface-200 text-xs text-surface-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            No pending leave requests! All approvals are up to date.
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {pendingLeaves.slice(0, 4).map(req => (
              <div
                key={req.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar src={req.avatar} name={req.employeeName} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-surface-900 truncate">
                        {req.employeeName}
                      </span>
                      <Badge variant={req.leaveType.toLowerCase() as any} size="sm">
                        {req.leaveType} ({req.days}d)
                      </Badge>
                    </div>
                    <p className="text-xs text-surface-500 truncate mt-0.5">
                      {formatDate(req.startDate)} to {formatDate(req.endDate)} • &ldquo;{req.reason}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedReviewLeave(req)}
                  >
                    Review Request
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
      />

      {/* Leave Approval Modal */}
      <LeaveApprovalModal
        isOpen={!!selectedReviewLeave}
        onClose={() => setSelectedReviewLeave(null)}
        request={selectedReviewLeave}
        onApprove={(id, comment) => approveLeave(id, comment)}
        onReject={(id, comment) => rejectLeave(id, comment)}
      />
    </div>
  );
};
