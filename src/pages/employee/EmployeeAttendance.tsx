import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/common/StatCard';
import { CheckInCard } from '../../components/attendance/CheckInCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AttendanceRecord } from '../../types/attendance';
import { formatDate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeAttendance } = useData();
  const { success } = useToast();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const empId = user?.employeeId || 'DF-1001';
  const attendanceRecords = getEmployeeAttendance(empId);

  // Stats calculation
  const stats = useMemo(() => {
    const present = attendanceRecords.filter(r => r.status === 'Present').length;
    const absent = attendanceRecords.filter(r => r.status === 'Absent').length;
    const halfDay = attendanceRecords.filter(r => r.status === 'Half Day').length;
    const leave = attendanceRecords.filter(r => r.status === 'Leave').length;
    const totalHours = attendanceRecords.reduce((acc, r) => acc + (r.workingHours || 0), 0);

    return { present, absent, halfDay, leave, totalHours };
  }, [attendanceRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (statusFilter === 'all') return attendanceRecords;
    return attendanceRecords.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
  }, [attendanceRecords, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV(`My_Attendance_${empId}.csv`, attendanceRecords);
    success('Attendance Exported', 'CSV attendance record downloaded successfully.');
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Date',
      accessor: 'date',
      render: row => (
        <div className="font-semibold text-surface-900 flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-primary-600" />
          <span>{formatDate(row.date)}</span>
        </div>
      ),
    },
    {
      header: 'Check In',
      accessor: 'checkIn',
      render: row => (
        <span className="font-mono text-xs font-semibold text-surface-800">
          {row.checkIn || '—'}
        </span>
      ),
    },
    {
      header: 'Check Out',
      accessor: 'checkOut',
      render: row => (
        <span className="font-mono text-xs font-semibold text-surface-800">
          {row.checkOut || '—'}
        </span>
      ),
    },
    {
      header: 'Working Hours',
      accessor: 'workingHours',
      render: row => (
        <span className="font-semibold text-surface-900">
          {row.workingHours > 0 ? `${row.workingHours} hrs` : '0 hrs'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: row => (
        <Badge variant={row.status.toLowerCase() as any} size="sm" dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Remarks / Notes',
      accessor: 'notes',
      render: row => (
        <span className="text-xs text-surface-500 italic truncate max-w-xs block">
          {row.notes || 'Normal working shift'}
        </span>
      ),
    },
  ];

  // Weekly Grid Mock items
  const weekDays = [
    { day: 'Monday', date: 'Oct 12', checkIn: '08:55 AM', checkOut: '05:45 PM', hours: '8.3h', status: 'Present' },
    { day: 'Tuesday', date: 'Oct 13', checkIn: '09:05 AM', checkOut: '06:15 PM', hours: '8.5h', status: 'Present' },
    { day: 'Wednesday', date: 'Oct 14', checkIn: '09:12 AM', checkOut: 'In Progress', hours: '4.5h', status: 'Present' },
    { day: 'Thursday', date: 'Oct 15', checkIn: '—', checkOut: '—', hours: '0h', status: 'Scheduled' },
    { day: 'Friday', date: 'Oct 16', checkIn: '—', checkOut: '—', hours: '0h', status: 'Scheduled' },
    { day: 'Saturday', date: 'Oct 17', checkIn: '—', checkOut: '—', hours: '0h', status: 'Weekend' },
    { day: 'Sunday', date: 'Oct 18', checkIn: '—', checkOut: '—', hours: '0h', status: 'Weekend' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            My Attendance Logs
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Real-time daily punches, working hours calculation, and shift punctuality.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export Attendance (CSV)
          </Button>
        </div>
      </div>

      {/* Interactive Check-In / Check-Out Widget */}
      <CheckInCard />

      {/* Top Attendance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Present Days"
          value={stats.present}
          subtitle="This month"
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Half Days"
          value={stats.halfDay}
          subtitle="4h shifts logged"
          icon={<Clock className="w-5 h-5" />}
          colorScheme="amber"
        />

        <StatCard
          title="Leaves Taken"
          value={stats.leave}
          subtitle="Approved leaves"
          icon={<CalendarIcon className="w-5 h-5" />}
          colorScheme="indigo"
        />

        <StatCard
          title="Total Logged Hours"
          value={`${stats.totalHours.toFixed(1)} hrs`}
          subtitle="Average: 8.2 hrs / day"
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="primary"
        />
      </div>

      {/* View Switcher Tabs & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-surface-200/80 shadow-xs">
        <div className="flex items-center gap-2 bg-surface-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'daily'
                ? 'bg-white text-surface-900 shadow-2xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Daily Detailed Logs
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'weekly'
                ? 'bg-white text-surface-900 shadow-2xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Weekly Schedule Grid
          </button>
        </div>

        {viewMode === 'daily' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-surface-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-surface-50 border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="half day">Half Day</option>
              <option value="absent">Absent</option>
              <option value="leave">On Leave</option>
            </select>
          </div>
        )}
      </div>

      {/* Content based on View Mode */}
      {viewMode === 'daily' ? (
        <DataTable
          data={filteredRecords}
          columns={columns}
          searchPlaceholder="Search by date or remarks..."
          emptyTitle="No attendance records found"
          emptyDescription="You don't have any attendance logs matching the chosen filter."
          pageSize={7}
        />
      ) : (
        /* Weekly Calendar Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                item.status === 'Present'
                  ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                  : item.status === 'Weekend'
                  ? 'bg-surface-50/50 border-surface-200 text-surface-400'
                  : 'bg-white border-surface-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-surface-100">
                <span className="text-xs font-bold text-surface-800">{item.day}</span>
                <span className="text-[10px] font-medium text-surface-400">{item.date}</span>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <Badge
                  variant={
                    item.status === 'Present'
                      ? 'present'
                      : item.status === 'Weekend'
                      ? 'neutral'
                      : 'primary'
                  }
                  size="sm"
                  dot
                >
                  {item.status}
                </Badge>

                <div className="space-y-0.5 pt-1 text-[11px]">
                  <div className="flex justify-between text-surface-500">
                    <span>In:</span>
                    <span className="font-mono font-bold text-surface-800">{item.checkIn}</span>
                  </div>
                  <div className="flex justify-between text-surface-500">
                    <span>Out:</span>
                    <span className="font-mono font-bold text-surface-800">{item.checkOut}</span>
                  </div>
                  <div className="flex justify-between text-surface-500 pt-1 font-semibold">
                    <span>Hours:</span>
                    <span className="text-primary-600 font-bold">{item.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
