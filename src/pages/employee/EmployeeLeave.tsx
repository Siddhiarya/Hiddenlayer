import React, { useState, useMemo } from 'react';
import {
  Calendar,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LeaveRequest } from '../../types/leave';
import { formatDate } from '../../utils/dateUtils';

export const EmployeeLeave: React.FC = () => {
  const { user } = useAuth();
  const {
    getUserLeaveRequests,
    getEmployeeLeaveBalance,
    cancelLeave,
  } = useData();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const empId = user?.employeeId || 'DF-1001';
  const balance = getEmployeeLeaveBalance(empId);
  const userLeaves = getUserLeaveRequests(empId);

  const pendingCount = userLeaves.filter(l => l.status === 'Pending').length;

  const filteredLeaves = useMemo(() => {
    if (statusFilter === 'all') return userLeaves;
    return userLeaves.filter(l => l.status.toLowerCase() === statusFilter.toLowerCase());
  }, [userLeaves, statusFilter]);

  const handleConfirmCancel = () => {
    if (cancelTargetId) {
      cancelLeave(cancelTargetId);
      setCancelTargetId(null);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Request ID',
      accessor: 'id',
      render: row => (
        <span className="font-mono font-bold text-primary-600 text-xs">
          {row.id}
        </span>
      ),
    },
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      render: row => (
        <span className="font-semibold text-surface-900">
          {row.leaveType} Leave
        </span>
      ),
    },
    {
      header: 'Date Period',
      render: row => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-800">
          <Calendar className="w-3.5 h-3.5 text-primary-600" />
          <span>{formatDate(row.startDate)} – {formatDate(row.endDate)}</span>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessor: 'days',
      render: row => (
        <span className="font-bold text-surface-900">
          {row.days} {row.days === 1 ? 'Day' : 'Days'}
        </span>
      ),
    },
    {
      header: 'Reason / Remarks',
      accessor: 'reason',
      render: row => (
        <div className="max-w-xs truncate text-xs text-surface-600" title={row.reason}>
          {row.reason}
          {row.adminComment && (
            <span className="block text-[10px] text-surface-400 italic">
              Note: {row.adminComment}
            </span>
          )}
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
      render: row =>
        row.status === 'Pending' ? (
          <button
            onClick={() => setCancelTargetId(row.id)}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Cancel
          </button>
        ) : (
          <span className="text-xs text-surface-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            Leave & Time-Off Management
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Apply for annual, sick, or casual leaves and track manager approval statuses.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsApplyModalOpen(true)}
        >
          + Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Paid Leave (Vacation)"
          value={`${balance.paid.remaining} / ${balance.paid.total}`}
          subtitle={`${balance.paid.used} days taken this year`}
          icon={<Calendar className="w-5 h-5" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Sick Leave"
          value={`${balance.sick.remaining} / ${balance.sick.total}`}
          subtitle={`${balance.sick.used} days taken`}
          icon={<Clock className="w-5 h-5" />}
          colorScheme="indigo"
        />

        <StatCard
          title="Casual / Urgent"
          value={`${balance.casual.remaining} / ${balance.casual.total}`}
          subtitle={`${balance.casual.used} days taken`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="sky"
        />

        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          subtitle={pendingCount > 0 ? 'Under review by HR' : 'No pending requests'}
          icon={<AlertCircle className="w-5 h-5" />}
          colorScheme={pendingCount > 0 ? 'amber' : 'neutral'}
        />
      </div>

      {/* Leave Requests Data Table */}
      <DataTable
        data={filteredLeaves}
        columns={columns}
        searchPlaceholder="Search by reason or leave type..."
        searchFilter={(item, q) =>
          item.leaveType.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        }
        filterControls={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        }
        emptyTitle="No leave applications found"
        emptyDescription="You have not submitted any leave requests matching the current filter."
        pageSize={6}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      {/* Cancel Request Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this pending leave application? This action cannot be undone."
        confirmText="Yes, Cancel Request"
        variant="danger"
      />
    </div>
  );
};
