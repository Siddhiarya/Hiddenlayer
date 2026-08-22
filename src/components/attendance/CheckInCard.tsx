import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  LogOut,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatTime } from '../../utils/dateUtils';

export const CheckInCard: React.FC = () => {
  const { user } = useAuth();
  const { todayUserAttendance, checkIn, checkOut } = useData();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isCheckedIn = !!todayUserAttendance?.checkIn;
  const isCheckedOut = !!todayUserAttendance?.checkOut;

  // Live timer for active session
  useEffect(() => {
    let interval: any = null;
    if (isCheckedIn && !isCheckedOut) {
      // Simulate live duration counter
      setElapsedSeconds(4 * 3600 + 32 * 60 + 10);
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (isCheckedOut) {
      setElapsedSeconds(8 * 3600 + 30 * 60);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, isCheckedOut]);

  const formatDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleConfirmCheckout = () => {
    checkOut();
    setShowCheckoutModal(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-white to-primary-50/30 border border-surface-200/80 shadow-xs relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-surface-900">Attendance Status</h3>
            <Badge
              variant={
                isCheckedOut
                  ? 'active'
                  : isCheckedIn
                  ? 'present'
                  : 'neutral'
              }
              dot
            >
              {isCheckedOut ? 'Completed' : isCheckedIn ? 'Present & Working' : 'Not Checked In'}
            </Badge>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Track your daily working hours and punctual shifts.
          </p>
        </div>

        {/* Live Active Clock */}
        <div className="flex items-center gap-2 bg-surface-50 px-3 py-1.5 rounded-xl border border-surface-200/60 self-start sm:self-auto">
          <Clock className="w-4 h-4 text-primary-600 animate-pulse-subtle" />
          <span className="text-xs font-mono font-semibold text-surface-800">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
            Check-In Time
          </span>
          <p className="text-sm font-bold text-surface-900">
            {todayUserAttendance?.checkIn || '— : —'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
            Check-Out Time
          </span>
          <p className="text-sm font-bold text-surface-900">
            {todayUserAttendance?.checkOut || (isCheckedIn ? 'In Progress' : '— : —')}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
            Shift Schedule
          </span>
          <p className="text-sm font-bold text-surface-900">09:00 AM – 06:00 PM</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
            Total Hours Today
          </span>
          <p className="text-sm font-bold text-primary-600">
            {isCheckedOut ? '8.5 hrs' : isCheckedIn ? '4.5 hrs (active)' : '0 hrs'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        {!isCheckedIn ? (
          <Button
            size="md"
            variant="primary"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={checkIn}
            className="w-full sm:w-auto"
          >
            Check In Now
          </Button>
        ) : !isCheckedOut ? (
          <Button
            size="md"
            variant="secondary"
            leftIcon={<LogOut className="w-4 h-4 text-amber-600" />}
            onClick={() => setShowCheckoutModal(true)}
            className="w-full sm:w-auto hover:border-amber-300"
          >
            Check Out for the Day
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Shift Completed! Check-out logged at {todayUserAttendance.checkOut}.</span>
          </div>
        )}

        <div className="text-xs text-surface-500 hidden md:flex items-center gap-1.5 ml-auto">
          <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
          <span>98.2% On-time punctuality rate this month</span>
        </div>
      </div>

      {/* Checkout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={handleConfirmCheckout}
        title="Check Out Confirmation"
        message="Are you sure you want to check out for today? This will record your final working duration."
        confirmText="Yes, Check Out"
        variant="warning"
      />
    </div>
  );
};
