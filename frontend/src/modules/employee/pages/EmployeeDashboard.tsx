import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { employeeApi } from '../services/employeeApi';
import { 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveBalance, 
  WeeklyAttendanceSummary 
} from '../../../types/employee';
import { CheckInOutWidget } from '../components/CheckInOutWidget';
import { StatCard } from '../../../components/common/StatCard';
import { Badge } from '../../../components/common/Badge';
import { LoadingSkeleton } from '../../../components/common/LoadingSkeleton';
import { 
  User, 
  CalendarCheck, 
  CalendarDays, 
  CreditCard, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyAttendanceSummary | null>(null);
  const [latestLeave, setLatestLeave] = useState<LeaveRequest | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      const [attRes, weekRes, leaveRes] = await Promise.all([
        employeeApi.getAttendance(),
        employeeApi.getWeeklyAttendance(),
        employeeApi.getLeaves()
      ]);

      if (attRes.success && attRes.data) {
        setTodayAttendance(attRes.data.today);
      }
      if (weekRes.success && weekRes.data) {
        setWeeklySummary(weekRes.data);
      }
      if (leaveRes.success && leaveRes.data) {
        setLeaveBalance(leaveRes.data.balance);
        if (leaveRes.data.leaves && leaveRes.data.leaves.length > 0) {
          setLatestLeave(leaveRes.data.leaves[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100 backdrop-blur-xs border border-white/10 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Dayflow Self-Service Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {user?.name.split(' ')[0]}! 👋
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-brand-100 max-w-xl font-normal leading-relaxed">
              {user?.designation} • {user?.department} Department
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/employee/attendance')}
              className="inline-flex items-center space-x-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition-colors"
            >
              <CalendarCheck className="h-4 w-4 text-brand-600" />
              <span>Attendance Hub</span>
            </button>
            <button
              onClick={() => navigate('/employee/leaves')}
              className="inline-flex items-center space-x-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20 transition-colors"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Request Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Workday Status + Quick Access Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-In / Check-Out Realtime Widget */}
        <div className="lg:col-span-1">
          <CheckInOutWidget
            todayAttendance={todayAttendance}
            onStatusChange={fetchDashboardData}
          />
        </div>

        {/* Quick Access Action Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Profile */}
          <div
            onClick={() => navigate('/employee/profile')}
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                <User className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                View & Edit
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Employee Profile
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personal details, job role, manager & official documents.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-brand-600">
              <span>Open Profile</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Attendance */}
          <div
            onClick={() => navigate('/employee/attendance')}
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <Badge variant={!todayAttendance ? 'neutral' : !todayAttendance.checkOut ? 'Present' : todayAttendance.status === 'Half-day' ? 'Half-day' : 'Present'}>
                {!todayAttendance ? 'Not Checked In' : !todayAttendance.checkOut ? 'Currently Working' : todayAttendance.status === 'Half-day' ? 'Shift Completed (Half-day)' : 'Shift Completed'}
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Attendance Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily check-ins, weekly timesheet summary & work hours.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
              <span>View Attendance Log</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Leaves */}
          <div
            onClick={() => navigate('/employee/leaves')}
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <CalendarDays className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                {leaveBalance?.paidLeave.remaining ?? 16} Days Available
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Leave & Time-Off
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Apply for paid, sick, or unpaid leave and track approval history.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-600">
              <span>Manage Leaves</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 4: Salary & Payroll */}
          <div
            onClick={() => navigate('/employee/payroll')}
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                Read-Only
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Salary & Payroll
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect salary structure, allowances, deductions & download payslips.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600">
              <span>View Payslips</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Weekly Hours"
          value={`${weeklySummary?.totalWorkingHours || 0} hrs`}
          subtitle="Current work week"
          icon={Clock}
          iconBgColor="bg-blue-50"
          iconColor="text-brand-600"
          trend={{ value: `${weeklySummary?.presentDays || 0} days present`, isPositive: true }}
        />
        <StatCard
          title="Paid Leave Left"
          value={`${leaveBalance?.paidLeave.remaining || 0} days`}
          subtitle={`Used: ${leaveBalance?.paidLeave.used || 0} of ${leaveBalance?.paidLeave.total || 20}`}
          icon={CalendarDays}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ value: 'Annual quota', isPositive: true }}
        />
        <StatCard
          title="Sick Leave Left"
          value={`${leaveBalance?.sickLeave.remaining || 0} days`}
          subtitle={`Used: ${leaveBalance?.sickLeave.used || 0} of ${leaveBalance?.sickLeave.total || 10}`}
          icon={FileCheck}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Net Take-Home"
          value={`$${user?.salary?.netSalary?.toLocaleString() || '7,800'}`}
          subtitle="Monthly base net"
          icon={TrendingUp}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Activity & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Leave Request Status */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Latest Leave Request Status</h3>
            <button
              onClick={() => navigate('/employee/leaves')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All
            </button>
          </div>

          {latestLeave ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{latestLeave.leaveType}</span>
                <Badge variant={latestLeave.status}>{latestLeave.status}</Badge>
              </div>

              <div className="text-xs text-slate-600 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Dates:</span>
                  <span className="font-semibold">{latestLeave.startDate} to {latestLeave.endDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Duration:</span>
                  <span className="font-semibold">{latestLeave.numberOfDays} working days</span>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="text-slate-400 block text-[10px]">Reason:</span>
                <p className="italic bg-white p-2 rounded-lg border border-slate-200/60 mt-0.5">
                  "{latestLeave.remarks}"
                </p>
              </div>

              {latestLeave.adminComment && (
                <div className="text-xs text-slate-700 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/60">
                  <span className="text-blue-900 font-semibold block text-[10px]">HR/Admin Note:</span>
                  <p>{latestLeave.adminComment}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No recent leave requests filed.
            </div>
          )}
        </div>

        {/* Workday Tips & Company Notice */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Dayflow Workday Insights</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Synced
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Shift Timings</p>
                  <p className="text-slate-500 mt-0.5">Standard business hours: 09:00 AM – 06:00 PM (Monday to Friday).</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Check-In Policy</p>
                  <p className="text-slate-500 mt-0.5">Remember to check in upon logging in each morning to accurately log attendance.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Need HR Assistance?</span>
            <span className="text-xs font-semibold text-brand-600">{user?.manager}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
