import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { UserRole } from '../../types/auth';

export const SignupPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('DF-1025');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  // Password rules validation
  const passwordRules = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = Object.values(passwordRules).filter(Boolean).length;
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-surface-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-primary-500',
    'bg-emerald-500',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strengthScore < 3) {
      setError('Please choose a stronger password satisfying security requirements.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup({
        employeeId: employeeId.trim() || `DF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (res.success) {
        success('Account Registered', 'Please verify your email address to continue.');
        navigate('/verify-email');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-surface-200/80 shadow-xl p-6 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight text-surface-900 leading-tight">
              DAYFLOW
            </h1>
            <p className="text-[10px] text-surface-500 font-medium">
              Create Your HRMS Account
            </p>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">
            Register New Account
          </h2>
          <p className="text-xs text-surface-500">
            Join your organization’s Dayflow workspace.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Employee ID"
              placeholder="DF-1025"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              required
            />
            <Select
              label="Account Role"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              options={[
                { value: 'Employee', label: 'Employee' },
                { value: 'HR', label: 'HR Officer' },
              ]}
            />
          </div>

          <Input
            label="Full Name *"
            placeholder="e.g. Alex Morgan"
            leftIcon={<User className="w-4 h-4" />}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <Input
            label="Corporate Email *"
            type="email"
            placeholder="you@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password *"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-surface-600">Password Strength:</span>
                <span className="font-bold text-surface-800">
                  {strengthLabels[strengthScore]}
                </span>
              </div>

              {/* Progress bars */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      strengthScore >= step ? strengthColors[strengthScore] : 'bg-surface-200'
                    }`}
                  />
                ))}
              </div>

              {/* Requirements Checklist */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-surface-500">
                <div className="flex items-center gap-1.5">
                  {passwordRules.minLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                  )}
                  <span>At least 8 chars</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordRules.hasUpper ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                  )}
                  <span>Uppercase letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordRules.hasLower ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                  )}
                  <span>Lowercase letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordRules.hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                  )}
                  <span>Contains a number</span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account & Verify Email
          </Button>
        </form>

        <div className="text-center text-xs text-surface-500 pt-2 border-t border-surface-100">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 hover:text-primary-700 ml-1"
          >
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
};
