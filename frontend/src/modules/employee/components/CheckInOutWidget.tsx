import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Sparkles,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceRecord } from '../../../types/employee';
import { employeeApi } from '../services/employeeApi';
import { Badge } from '../../../components/common/Badge';

interface CheckInOutWidgetProps {
  todayAttendance: AttendanceRecord | null;
  onStatusChange: () => void;
}

export const CheckInOutWidget: React.FC<CheckInOutWidgetProps> = ({
  todayAttendance,
  onStatusChange
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const isCheckedIn = !!todayAttendance?.checkIn;
  const isCheckedOut = !!todayAttendance?.checkOut;

  // Live timer for active check-in
  useEffect(() => {
    if (isCheckedIn && !isCheckedOut && todayAttendance?.checkIn) {
      const startTime = new Date(todayAttendance.checkIn).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = Math.max(0, now - startTime);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else if (isCheckedOut && todayAttendance?.workingHours !== undefined) {
      const totalMin = Math.round(todayAttendance.workingHours * 60);
      const hours = Math.floor(totalMin / 60);
      const minutes = totalMin % 60;
      setElapsedTime(`${hours}h ${minutes}m (${todayAttendance.workingHours} hrs)`);
    } else {
      setElapsedTime('00:00:00');
    }
  }, [isCheckedIn, isCheckedOut, todayAttendance]);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await employeeApi.checkIn();
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Checked in successfully! You are currently working.');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      onStatusChange();
    } else {
      setError(res.message || 'Failed to check in.');
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await employeeApi.checkOut();
    setLoading(false);

    if (res.success) {
      setSuccessMessage(`Checked out successfully! Total work time: ${res.data?.workingHours} hrs.`);
      onStatusChange();
    } else {
      setError(res.message || 'Failed to check out.');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`flex h-2.5 w-2.5 rounded-full ${
              isCheckedOut ? 'bg-slate-400' : isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`} />
            <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
              Workday Status
            </h3>
          </div>
          {isCheckedOut ? (
            <Badge variant={todayAttendance?.status === 'Half-day' ? 'Half-day' : 'Present'}>
              {todayAttendance?.status === 'Half-day' ? 'Shift Completed (Half-day)' : 'Shift Completed'}
            </Badge>
          ) : isCheckedIn ? (
            <Badge variant="Present">Currently Working</Badge>
          ) : (
            <Badge variant="neutral">Not Checked In</Badge>
          )}
        </div>

        {/* Center Live Working Counter */}
        <div className="my-6 text-center">
          <p className="text-xs font-medium text-slate-400 mb-1">
            {isCheckedOut ? 'Total Working Duration' : isCheckedIn ? 'Workday Shift Timer (Active)' : 'Today\'s Shift Time'}
          </p>
          <div className="font-mono text-4xl font-extrabold tracking-tight text-white flex items-center justify-center space-x-2">
            <Clock className={`h-7 w-7 ${isCheckedIn && !isCheckedOut ? 'text-emerald-400 animate-pulse' : 'text-brand-400'} inline-block`} />
            <span className={isCheckedOut ? 'text-2xl sm:text-3xl' : ''}>{elapsedTime}</span>
          </div>
          <div className="mt-3 flex items-center justify-center space-x-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 mr-1">Check-in:</span>
              <span className="font-semibold text-slate-200">
                {isCheckedIn && todayAttendance?.checkIn
                  ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">Check-out:</span>
              <span className="font-semibold text-slate-200">
                {isCheckedOut && todayAttendance?.checkOut
                  ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Check-In for Today</span>
                  <Sparkles className="h-4 w-4 text-emerald-200" />
                </>
              )}
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-red-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Check-Out & End Shift</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center space-x-2 rounded-xl bg-slate-800/80 border border-slate-700/80 py-3 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>You have completed your workday attendance. Great job!</span>
            </div>
          )}
        </div>

        {/* Feedback messages */}
        {error && (
          <p className="mt-3 text-center text-xs font-medium text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="mt-3 text-center text-xs font-medium text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
};
