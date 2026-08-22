import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

export const VerifyEmailPage: React.FC = () => {
  const { pendingVerificationEmail, verifyEmail, resendVerificationCode } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['8', '4', '2', '9', '1', '0']);
  const [countdown, setCountdown] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const displayEmail = pendingVerificationEmail || 'alex.m@dayflow.com';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleResend = async () => {
    await resendVerificationCode();
    setCountdown(60);
    success('Code Resent', `A new verification code was sent to ${displayEmail}.`);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await verifyEmail(code);
      if (res.success) {
        success('Email Verified!', 'Your account has been confirmed. Welcome to Dayflow!');
        navigate('/employee/dashboard');
      } else {
        setError(res.message || 'Verification failed. Try code: 842910');
        toastError('Verification Failed', res.message);
      }
    } catch (err) {
      setError('Error verifying email code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-surface-200/80 shadow-xl p-6 sm:p-10 text-center space-y-6">
        {/* Animated Mail Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-glass">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">
            Verify your email
          </h2>
          <p className="text-xs text-surface-500">
            We sent a 6-digit confirmation code to
          </p>
          <p className="text-sm font-bold text-primary-700 bg-primary-50/70 py-1.5 px-3 rounded-xl border border-primary-100 inline-block">
            {displayEmail}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-fadeIn">
            {error}
          </div>
        )}

        {/* 6 Digit Inputs */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-md"
            isLoading={isVerifying}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Verify & Enter Workspace
          </Button>
        </form>

        {/* Resend & Countdown */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-surface-100 text-xs">
          {countdown > 0 ? (
            <span className="text-surface-500">
              Resend code in <strong className="text-surface-800">{countdown}s</strong>
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Code
            </button>
          )}

          <Link
            to="/signup"
            className="text-surface-400 hover:text-surface-600 transition-colors text-[11px]"
          >
            Wrong email address? Change email
          </Link>
        </div>
      </div>
    </div>
  );
};
