import React, { useState } from 'react';
import { CheckCircle2, XCircle, Calendar, User, FileText } from 'lucide-react';
import { LeaveRequest } from '../../types/leave';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { formatDate } from '../../utils/dateUtils';

export interface LeaveApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment: string) => void;
}

export const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  const [adminComment, setAdminComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  if (!request) return null;

  const handleAction = (type: 'approve' | 'reject') => {
    setError('');
    if (type === 'reject' && !adminComment.trim()) {
      setError('Please provide a reason for declining the leave request.');
      return;
    }

    if (type === 'approve') {
      onApprove(request.id, adminComment.trim() || undefined);
    } else {
      onReject(request.id, adminComment.trim());
    }

    onClose();
    setAdminComment('');
    setActionType(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Application"
      description={`Request ID: ${request.id} • Submitted on ${formatDate(request.appliedOn)}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Applicant Card */}
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={request.avatar}
              name={request.employeeName}
              size="md"
            />
            <div>
              <h4 className="text-sm font-bold text-surface-900">
                {request.employeeName}
              </h4>
              <p className="text-xs text-surface-500">
                {request.department} • {request.employeeId}
              </p>
            </div>
          </div>
          <Badge variant={request.leaveType.toLowerCase() as any} size="md">
            {request.leaveType} Leave
          </Badge>
        </div>

        {/* Leave Duration & Dates */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-surface-200">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              Date Period
            </span>
            <p className="text-xs sm:text-sm font-bold text-surface-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary-600" />
              {formatDate(request.startDate)} – {formatDate(request.endDate)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              Total Days
            </span>
            <p className="text-sm font-bold text-primary-600">
              {request.days} {request.days === 1 ? 'Day' : 'Days'}
            </p>
          </div>
        </div>

        {/* Reason Section */}
        <div className="space-y-1.5 text-left">
          <span className="text-xs font-semibold text-surface-700">
            Employee Reason / Statement:
          </span>
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/70 text-xs sm:text-sm text-surface-800 leading-relaxed italic">
            &ldquo;{request.reason}&rdquo;
          </div>
        </div>

        {/* Admin Comments / Rejection Reason Input */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-surface-700">
            Admin Note / Reason {actionType === 'reject' && <span className="text-rose-500">*</span>}:
          </label>
          <textarea
            rows={2}
            value={adminComment}
            onChange={e => {
              setAdminComment(e.target.value);
              setError('');
            }}
            placeholder={
              actionType === 'reject'
                ? 'State the reason for rejection (required)...'
                : 'Optional notes or wishes for the employee...'
            }
            className="w-full px-3.5 py-2 bg-white border border-surface-200 rounded-xl text-xs sm:text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
          />
          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-surface-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            leftIcon={<XCircle className="w-4 h-4" />}
            onClick={() => {
              setActionType('reject');
              handleAction('reject');
            }}
          >
            Reject Request
          </Button>

          <Button
            type="button"
            variant="primary"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => {
              setActionType('approve');
              handleAction('approve');
            }}
          >
            Approve Leave
          </Button>
        </div>
      </div>
    </Modal>
  );
};
