import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { LeaveType, LeaveBalance } from '../../../types/employee';
import { employeeApi } from '../services/employeeApi';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveBalance: LeaveBalance | null;
  onSuccess: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  leaveBalance,
  onSuccess
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid Leave');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calculate working days whenever startDate or endDate changes
  useEffect(() => {
    if (!startDate || !endDate) {
      setCalculatedDays(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setCalculatedDays(0);
      return;
    }

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // Exclude Saturday (6) and Sunday (0)
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    setCalculatedDays(count === 0 ? 1 : count);
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate) {
      setError('Please select both start date and end date.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('Start date cannot be after end date.');
      return;
    }

    if (!remarks || remarks.trim().length < 5) {
      setError('Please provide a clear reason / remarks (minimum 5 characters).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await employeeApi.applyLeave({
        leaveType,
        startDate,
        endDate,
        remarks: remarks.trim()
      });

      setIsLoading(false);

      if (res.success) {
        setSuccess('Leave application submitted successfully! Status: Pending.');
        setTimeout(() => {
          onSuccess();
          onClose();
          // Reset form
          setStartDate('');
          setEndDate('');
          setRemarks('');
          setSuccess(null);
        }, 1200);
      } else {
        setError(res.message || 'Failed to submit leave request.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An unexpected network error occurred.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Time-Off / Leave"
      subtitle="Submit a formal leave request for HR/Manager approval."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Leave Balance Overview Banner */}
        {leaveBalance && (
          <div className="rounded-xl bg-brand-50/70 border border-brand-200/70 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-brand-800">
              <Info className="h-4 w-4 text-brand-600 shrink-0" />
              <span className="font-semibold">Available Balances:</span>
            </div>
            <div className="flex space-x-3 text-slate-700 font-medium">
              <span className="bg-white px-2 py-0.5 rounded-md border border-brand-200 shadow-xs">
                Paid: <strong className="text-brand-700">{leaveBalance.paidLeave.remaining}</strong> days
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-brand-200 shadow-xs">
                Sick: <strong className="text-emerald-700">{leaveBalance.sickLeave.remaining}</strong> days
              </span>
            </div>
          </div>
        )}

        {/* Leave Type Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Leave Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
          >
            <option value="Paid Leave">Paid Leave (Annual / Vacation)</option>
            <option value="Sick Leave">Sick Leave (Medical / Illness)</option>
            <option value="Unpaid Leave">Unpaid Leave (Loss of Pay)</option>
          </select>
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Calculated working duration indicator */}
        {calculatedDays > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-brand-600" />
              <span>Requested Duration:</span>
            </div>
            <span className="rounded-md bg-white px-2.5 py-1 text-brand-700 font-bold border border-slate-200">
              {calculatedDays} working {calculatedDays === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}

        {/* Remarks / Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Remarks <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Please provide details about your leave request for your manager..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || calculatedDays === 0}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Leave Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
