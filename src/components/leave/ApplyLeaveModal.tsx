import React, { useState } from 'react';
import { Calendar, AlertCircle, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { LeaveType } from '../../types/leave';
import { calculateDaysBetween, getTodayDateString } from '../../utils/dateUtils';

export interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { applyLeave, getEmployeeLeaveBalance } = useData();

  const [leaveType, setLeaveType] = useState<LeaveType>('Paid');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const balance = user ? getEmployeeLeaveBalance(user.employeeId) : null;
  const days = calculateDaysBetween(startDate, endDate);

  const getRemainingForType = (type: LeaveType) => {
    if (!balance) return 0;
    switch (type) {
      case 'Paid':
        return balance.paid.remaining;
      case 'Sick':
        return balance.sick.remaining;
      case 'Casual':
        return balance.casual.remaining;
      default:
        return 0;
    }
  };

  const remainingDays = getRemainingForType(leaveType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (days <= 0) {
      setError('Invalid date duration.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason or remarks for your leave request.');
      return;
    }

    if (leaveType !== 'Unpaid' && days > remainingDays) {
      setError(
        `You only have ${remainingDays} day(s) of ${leaveType} leave remaining. Please adjust your request.`
      );
      return;
    }

    applyLeave({
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason.trim(),
    });

    onClose();
    setReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave / Time Off"
      description="Submit a new time-off request for HR and Manager approval."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Leave Type */}
        <div className="space-y-1.5">
          <Select
            label="Leave Type"
            value={leaveType}
            onChange={e => setLeaveType(e.target.value as LeaveType)}
            options={[
              { value: 'Paid', label: 'Paid Leave (Annual / Vacation)' },
              { value: 'Sick', label: 'Sick Leave (Medical)' },
              { value: 'Casual', label: 'Casual / Urgent Personal Leave' },
              { value: 'Unpaid', label: 'Unpaid Leave (Loss of Pay)' },
            ]}
          />
          {balance && (
            <p className="text-[11px] text-surface-500 flex items-center gap-1 mt-1">
              <Info className="w-3.5 h-3.5 text-primary-500" />
              <span>
                Available balance for <strong>{leaveType}</strong>:{' '}
                <strong className="text-primary-600">{remainingDays} days</strong>
              </span>
            </p>
          )}
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            min={startDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* Calculated Days Summary Pill */}
        <div className="p-3 rounded-xl bg-primary-50/60 border border-primary-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary-900">
            Requested Duration:
          </span>
          <span className="text-xs font-bold text-primary-700 bg-white px-2.5 py-1 rounded-lg border border-primary-200 shadow-2xs">
            {days} {days === 1 ? 'Working Day' : 'Working Days'}
          </span>
        </div>

        {/* Reason */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-surface-700 tracking-wide">
            Reason / Remarks <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Briefly describe the reason for your time off..."
            className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-xl text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
            required
          />
        </div>

        {/* Modal Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
