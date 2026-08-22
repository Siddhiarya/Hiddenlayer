import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const homePath = user?.role === 'Admin' || user?.role === 'HR' ? '/admin/dashboard' : '/employee/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-surface-200/80 shadow-xl">
        <div className="w-20 h-20 rounded-3xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mx-auto shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider font-mono">
            404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            Looks like this page took a day off.
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 leading-relaxed">
            The page or route you were looking for doesn&apos;t exist, or has been moved to another department.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            leftIcon={<Home className="w-4 h-4" />}
            onClick={() => navigate(homePath)}
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
