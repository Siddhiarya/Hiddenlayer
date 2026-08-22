import React, { useState, useEffect } from 'react';
import { employeeApi } from '../services/employeeApi';
import { LeaveRequest, LeaveBalance } from '../../../types/employee';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { StatCard } from '../../../components/common/StatCard';
import { Badge } from '../../../components/common/Badge';
import { LoadingSkeleton } from '../../../components/common/LoadingSkeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { 
  CalendarDays, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Filter
} from 'lucide-react';

export const EmployeeLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchLeavesData = async () => {
    setIsLoading(true);
    try {
      const res = await employeeApi.getLeaves();
      if (res.success && res.data) {
        setLeaves(res.data.leaves);
        setBalance(res.data.balance);
      }
    } catch (err) {
      console.error('Failed to fetch leave history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesData();
  }, []);

  const filteredLeaves = leaves.filter(l => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Apply CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
            <CalendarDays className="h-4 w-4" />
            <span>Time-Off Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave Requests & Entitlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Submit leave requests, check your annual leave quotas, and track the live approval status of your time-off applications.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Balance Quota Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Your Annual Leave Quota & Balances
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Paid Leave (Annual)"
            value={`${balance?.paidLeave.remaining || 0} Days`}
            subtitle={`Used: ${balance?.paidLeave.used || 0} / Total: ${balance?.paidLeave.total || 20} days`}
            icon={CheckCircle2}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            trend={{ value: 'Full Pay', isPositive: true }}
          />
          <StatCard
            title="Sick Leave (Medical)"
            value={`${balance?.sickLeave.remaining || 0} Days`}
            subtitle={`Used: ${balance?.sickLeave.used || 0} / Total: ${balance?.sickLeave.total || 10} days`}
            icon={Clock}
            iconBgColor="bg-teal-50"
            iconColor="text-teal-600"
            trend={{ value: 'Medical Covered', isPositive: true }}
          />
          <StatCard
            title="Unpaid Leave"
            value={`${balance?.unpaidLeave.used || 0} Days`}
            subtitle="Loss of Pay leaves taken"
            icon={XCircle}
            iconBgColor="bg-slate-100"
            iconColor="text-slate-600"
          />
        </div>
      </div>

      {/* Leave History Table */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Leave History & Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">All previously submitted leave requests and manager feedback.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 py-1.5 px-3 text-xs font-semibold text-slate-700 bg-white focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All Statuses ({leaves.length})</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {filteredLeaves.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Employee Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HR/Admin Feedback</th>
                  <th className="py-3 px-4 rounded-r-xl">Requested On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {l.leaveType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {l.startDate} <span className="text-slate-400">to</span> {l.endDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {l.numberOfDays} {l.numberOfDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={l.remarks}>
                      {l.remarks}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={l.status}>{l.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {l.adminComment ? (
                        <span className="text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded-md text-[11px] block max-w-xs truncate" title={l.adminComment}>
                          {l.adminComment}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting review</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No Leave Records Found"
              description="No leave applications match the selected filter."
              actionText="Apply for Leave"
              onAction={() => setIsApplyModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        leaveBalance={balance}
        onSuccess={fetchLeavesData}
      />
    </div>
  );
};
