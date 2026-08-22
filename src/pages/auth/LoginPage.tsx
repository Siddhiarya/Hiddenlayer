import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Calendar,
  CreditCard,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('employee@dayflow.com');
  const [password, setPassword] = useState('employee123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        success('Welcome Back!', 'Successfully authenticated into Dayflow.');
        if (email.includes('admin') || email.includes('hr')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setError(res.message || 'Invalid credentials');
        toastError('Login Failed', res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-50 text-surface-900 selection:bg-primary-500 selection:text-white">
      {/* Left Branding Showcase */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-950 via-primary-950 to-indigo-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Abstract glowing background shapes */}
        <div className="absolute top-0 -left-10 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-10 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">DAYFLOW</h1>
            <p className="text-[11px] text-primary-300 font-medium tracking-wide">
              Human Resource Management System
            </p>
          </div>
        </div>

        {/* Value Proposition Hero Content */}
        <div className="my-auto py-12 relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-primary-200">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Gen Enterprise HR Platform</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Every workday, <br />
            <span className="text-gradient from-primary-400 via-brand-300 to-indigo-300">
              perfectly aligned.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Unify smart employee directories, automated attendance tracking, instant leave approval workflows, and transparent payroll insights in one unified experience.
          </p>

          {/* Quick Feature Pillars */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-300">
                <Clock className="w-4 h-4 text-primary-400" /> Attendance
              </div>
              <p className="text-xs text-slate-400">1-Click Check In with live hours calculation</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-300">
                <Calendar className="w-4 h-4 text-primary-400" /> Time-Off
              </div>
              <p className="text-xs text-slate-400">Seamless request & multi-tier approval</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SOC2 & GDPR Compliant Security</span>
          </div>
          <span>v1.0 Demo Ready</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="max-w-md w-full space-y-7">
          {/* Header */}
          <div className="space-y-2 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Sign In to Dayflow
            </h2>
            <p className="text-xs sm:text-sm text-surface-500">
              Enter your corporate credentials or choose a preloaded demo persona.
            </p>
          </div>

          {/* Demo Personas Quick Fill Helper */}
          <div className="p-3.5 rounded-2xl bg-surface-100/80 border border-surface-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                ⚡ 1-Click Demo Accounts:
              </span>
              <span className="text-[10px] text-surface-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('employee@dayflow.com', 'employee123')}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                  email === 'employee@dayflow.com'
                    ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                    : 'bg-white text-surface-700 border-surface-200 hover:border-primary-400'
                }`}
              >
                Employee
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@dayflow.com', 'admin123')}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                  email === 'admin@dayflow.com'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white text-surface-700 border-surface-200 hover:border-purple-400'
                }`}
              >
                Admin (Sarah)
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('hr@dayflow.com', 'hr123')}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                  email === 'hr@dayflow.com'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-surface-700 border-surface-200 hover:border-blue-400'
                }`}
              >
                HR Lead
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-fadeIn">
                {error}
              </div>
            )}

            <Input
              label="Work Email Address"
              type="email"
              placeholder="you@dayflow.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-surface-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Demo notice: Use employee123, admin123, or hr123.')}
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Sign up redirect */}
          <div className="text-center text-xs text-surface-500 pt-2 border-t border-surface-100">
            Don’t have an employee account yet?{' '}
            <Link
              to="/signup"
              className="font-bold text-primary-600 hover:text-primary-700 ml-1"
            >
              Register New Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
