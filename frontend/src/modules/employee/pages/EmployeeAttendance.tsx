import React, { useState, useEffect } from 'react';
import { employeeApi } from '../services/employeeApi';
import { AttendanceRecord, WeeklyAttendanceSummary } from '../../../types/employee';
import { CheckInOutWidget } from '../components/CheckInOutWidget';
import { StatCard } from '../../../components/common/StatCard';
import { Badge } from '../../../components/common/Badge';
import { LoadingSkeleton } from '../../../components/common/LoadingSkeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  Search,
  Filter,
  CalendarDays
} from 'lucide-react';

export const EmployeeAttendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyAttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchAttendanceData = async () => {
    try {
      const [attRes, weekRes] = await Promise.all([
        employeeApi.getAttendance(),
        employeeApi.getWeeklyAttendance()
      ]);

      if (attRes.success && attRes.data) {
        setRecords(attRes.data.records);
        setTodayAttendance(attRes.data.today);
      }
      if (weekRes.success && weekRes.data) {
        setWeeklySummary(weekRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.date.includes(searchTerm) || (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Check-In Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              <CalendarCheck className="h-4 w-4" />
              <span>Time & Attendance Tracker</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Attendance Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
              Log daily workday check-in and check-out timestamps, monitor shifts, and review your personal attendance timesheet.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Today's Status</span>
              <span className="font-bold text-slate-800">
                {!todayAttendance 
                  ? 'Not Checked In' 
                  : !todayAttendance.checkOut 
                    ? 'Currently Working' 
                    : todayAttendance.status === 'Half-day' 
                      ? 'Shift Completed (Half-day)' 
                      : 'Shift Completed'}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Check-In Time</span>
              <span className="font-bold text-slate-800">
                {todayAttendance?.checkIn
                  ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px]">Working Hours</span>
              <span className="font-bold text-brand-600">
                {todayAttendance?.checkOut && todayAttendance.workingHours !== undefined
                  ? `${todayAttendance.workingHours} hrs`
                  : todayAttendance?.checkIn
                    ? 'In Progress'
                    : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Check-In Widget */}
        <div className="lg:col-span-1">
          <CheckInOutWidget
            todayAttendance={todayAttendance}
            onStatusChange={fetchAttendanceData}
          />
        </div>
      </div>

      {/* Weekly Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            This Week's Attendance Summary
          </h2>
          {weeklySummary && (
            <span className="text-xs text-slate-500 font-medium">
              {weeklySummary.weekStart} to {weeklySummary.weekEnd}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Total Days"
            value={weeklySummary?.totalWorkingDays || 5}
            subtitle="Working schedule"
            icon={Calendar}
            iconBgColor="bg-slate-100"
            iconColor="text-slate-700"
          />
          <StatCard
            title="Present"
            value={weeklySummary?.presentDays || 0}
            subtitle="Full shifts"
            icon={CheckCircle2}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Half-Days"
            value={weeklySummary?.halfDays || 0}
            subtitle="Partial shifts"
            icon={AlertTriangle}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            title="Leaves"
            value={weeklySummary?.leaveDays || 0}
            subtitle="Approved off"
            icon={CalendarDays}
            iconBgColor="bg-sky-50"
            iconColor="text-sky-600"
          />
          <StatCard
            title="Absent"
            value={weeklySummary?.absentDays || 0}
            subtitle="Missed days"
            icon={XCircle}
            iconBgColor="bg-rose-50"
            iconColor="text-rose-600"
          />
          <StatCard
            title="Total Hours"
            value={`${weeklySummary?.totalWorkingHours || 0}h`}
            subtitle="Logged hours"
            icon={Clock}
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>
      </div>

      {/* Daily Attendance History Table */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daily Attendance Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing your complete personal attendance record history.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by date (YYYY-MM)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 sm:w-56 rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Half-day">Half-day</option>
                <option value="Leave">Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="mt-6 overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Working Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => {
                  const checkInDisplay = r.checkIn 
                    ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--';
                  const checkOutDisplay = r.checkOut
                    ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">
                        {r.date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {checkInDisplay}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {checkOutDisplay}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {r.workingHours !== undefined ? `${r.workingHours} hrs` : r.checkIn && !r.checkOut ? 'In Progress' : '--'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={!r.checkOut && r.checkIn ? 'Present' : r.status}>
                          {!r.checkOut && r.checkIn ? 'Currently Working' : r.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                        {r.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="No Attendance Records Found"
              description="No attendance logs match your current search or filter criteria."
              actionText="Reset Filters"
              onAction={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
