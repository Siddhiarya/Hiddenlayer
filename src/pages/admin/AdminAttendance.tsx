import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Download,
  Printer,
  Filter,
  Users,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AttendanceRecord } from '../../types/attendance';
import { formatDate, getTodayDateString } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';

export const AdminAttendance: React.FC = () => {
  const { attendanceRecords, employees, getDailyAttendanceSummary } = useData();
  const { success } = useToast();

  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const summary = getDailyAttendanceSummary();

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(rec => {
      const matchDept = departmentFilter === 'all' || rec.department === departmentFilter;
      const matchStatus = statusFilter === 'all' || rec.status.toLowerCase() === statusFilter.toLowerCase();
      const matchDate = !selectedDate || rec.date === selectedDate;
      return matchDept && matchStatus && matchDate;
    });
  }, [attendanceRecords, departmentFilter, statusFilter, selectedDate]);

  const handleExportCSV = () => {
    const exportData = filteredRecords.map(r => ({
      'Employee ID': r.employeeId,
      'Employee Name': r.employeeName,
      'Department': r.department,
      'Date': r.date,
      'Check In': r.checkIn || '—',
      'Check Out': r.checkOut || '—',
      'Working Hours': r.workingHours,
      'Status': r.status,
    }));
    exportToCSV(`Company_Attendance_${selectedDate}.csv`, exportData);
    success('Attendance Exported', 'Company attendance report downloaded.');
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Employee',
      render: row => (
        <div>
          <p className="font-bold text-surface-900">{row.employeeName}</p>
          <p className="text-xs text-surface-500 font-mono">{row.employeeId}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: row => (
        <span className="font-medium text-surface-800">{row.department}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      render: row => (
        <span className="text-xs text-surface-700">{formatDate(row.date)}</span>
      ),
    },
    {
      header: 'Check In',
      accessor: 'checkIn',
      render: row => (
        <span className="font-mono text-xs font-semibold text-surface-900">
          {row.checkIn || '—'}
        </span>
      ),
    },
    {
      header: 'Check Out',
      accessor: 'checkOut',
      render: row => (
        <span className="font-mono text-xs font-semibold text-surface-900">
          {row.checkOut || '—'}
        </span>
      ),
    },
    {
      header: 'Working Hours',
      accessor: 'workingHours',
      render: row => (
        <span className="font-bold text-surface-900">
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Company Attendance Management
            </h1>
            <Badge variant="admin" size="sm">
              Org-Wide
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Real-time check-in logs, punctuality metrics, and work duration audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Present Today"
          value={`${summary.present} / ${summary.total}`}
          subtitle={`${Math.round((summary.present / (summary.total || 1)) * 100)}% attendance`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Half Days"
          value={summary.halfDay}
          subtitle="Partial shifts"
          icon={<Clock className="w-5 h-5" />}
          colorScheme="amber"
        />

        <StatCard
          title="On Planned Leave"
          value={summary.onLeave}
          subtitle="Approved time-off"
          icon={<CalendarIcon className="w-5 h-5" />}
          colorScheme="indigo"
        />

        <StatCard
          title="Absent / Unlogged"
          value={summary.absent}
          subtitle="Requires attention"
          icon={<XCircle className="w-5 h-5" />}
          colorScheme={summary.absent > 0 ? 'rose' : 'neutral'}
        />
      </div>

      {/* Main Table */}
      <DataTable
        data={filteredRecords}
        columns={columns}
        searchPlaceholder="Search by employee name or ID..."
        searchFilter={(item, q) =>
          item.employeeName.toLowerCase().includes(q) ||
          item.employeeId.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
        }
        filterControls={
          <div className="flex flex-wrap items-center gap-2">
            {/* Department */}
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="half day">Half Day</option>
              <option value="absent">Absent</option>
              <option value="leave">On Leave</option>
            </select>
          </div>
        }
        emptyTitle="No attendance records found"
        emptyDescription="There are no records matching your selected filter criteria."
        pageSize={8}
      />
    </div>
  );
};
