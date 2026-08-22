import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Download,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LeaveApprovalModal } from '../../components/leave/LeaveApprovalModal';
import { LeaveRequest } from '../../types/leave';
import { formatDate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';

export const AdminLeaves: React.FC = () => {
  const { leaveRequests, approveLeave, rejectLeave } = useData();
  const { success } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedReviewLeave, setSelectedReviewLeave] = useState<LeaveRequest | null>(null);

  // Stats calculation
  const pendingCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(l => l.status === 'Rejected').length;

  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter(req => {
      const matchStatus = statusFilter === 'all' || req.status.toLowerCase() === statusFilter.toLowerCase();
      const matchDept = departmentFilter === 'all' || req.department === departmentFilter;
      return matchStatus && matchDept;
    });
  }, [leaveRequests, statusFilter, departmentFilter]);

  const handleExportCSV = () => {
    const exportData = filteredLeaves.map(l => ({
      'Request ID': l.id,
      'Employee ID': l.employeeId,
      'Employee Name': l.employeeName,
      'Department': l.department,
      'Leave Type': l.leaveType,
      'Start Date': l.startDate,
      'End Date': l.endDate,
      'Days': l.days,
      'Reason': l.reason,
      'Status': l.status,
      'Applied On': l.appliedOn,
    }));
    exportToCSV('Company_Leave_Requests.csv', exportData);
    success('Leaves Exported', 'Downloaded leave requests CSV report.');
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Employee',
      render: row => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.employeeName} size="sm" />
          <div className="min-w-0">
            <p className="font-bold text-surface-900 truncate">{row.employeeName}</p>
            <p className="text-xs text-surface-500">{row.department} • {row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      render: row => (
        <span className="font-semibold text-surface-900">{row.leaveType} Leave</span>
      ),
    },
    {
      header: 'Date Range',
      render: row => (
        <div className="text-xs font-semibold text-surface-800">
          {formatDate(row.startDate)} – {formatDate(row.endDate)}
        </div>
      ),
    },
    {
      header: 'Days',
      accessor: 'days',
      render: row => (
        <span className="font-bold text-primary-600">
          {row.days} {row.days === 1 ? 'day' : 'days'}
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: row => (
        <div className="max-w-xs truncate text-xs text-surface-600" title={row.reason}>
          {row.reason}
        </div>
      ),
    },
    {
      header: 'Applied On',
      accessor: 'appliedOn',
      render: row => (
        <span className="text-xs text-surface-500">{formatDate(row.appliedOn)}</span>
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
      header: 'Actions',
      align: 'right',
      render: row =>
        row.status === 'Pending' ? (
          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
            <Button
              size="sm"
              variant="secondary"
              className="text-emerald-700 hover:bg-emerald-50 border-emerald-200"
              leftIcon={<Check className="w-3.5 h-3.5" />}
              onClick={() => approveLeave(row.id, 'Fast approved by Admin.')}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-700 hover:bg-rose-50 border-rose-200"
              leftIcon={<X className="w-3.5 h-3.5" />}
              onClick={() => setSelectedReviewLeave(row)}
            >
              Reject...
            </Button>
          </div>
        ) : (
          <span className="text-xs text-surface-400">
            {row.approvedBy ? `Reviewed by ${row.approvedBy}` : 'Processed'}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Leave & Time-Off Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full animate-pulse-subtle">
                {pendingCount} Awaiting Review
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Review company leave submissions, approve requests, and maintain team capacity.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
        >
          Export CSV Report
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle={pendingCount > 0 ? 'Requires immediate action' : 'No backlog'}
          icon={<Clock className="w-5 h-5" />}
          colorScheme={pendingCount > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Approved Leaves"
          value={approvedCount}
          subtitle="Processed this quarter"
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Rejected Requests"
          value={rejectedCount}
          subtitle="Due to blackout/capacity"
          icon={<XCircle className="w-5 h-5" />}
          colorScheme="rose"
        />
      </div>

      {/* Leave Requests DataTable */}
      <DataTable
        data={filteredLeaves}
        columns={columns}
        searchPlaceholder="Search by employee name or reason..."
        searchFilter={(item, q) =>
          item.employeeName.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q) ||
          item.leaveType.toLowerCase().includes(q)
        }
        filterControls={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

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
          </div>
        }
        emptyTitle="No leave requests found"
        emptyDescription="There are no applications matching your selected criteria."
        pageSize={8}
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
