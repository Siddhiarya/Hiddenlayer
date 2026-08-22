import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { EmployeeAttendance } from './pages/employee/EmployeeAttendance';
import { EmployeeLeave } from './pages/employee/EmployeeLeave';
import { EmployeePayroll } from './pages/employee/EmployeePayroll';
import { EmployeeNotifications } from './pages/employee/EmployeeNotifications';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEmployees } from './pages/admin/AdminEmployees';
import { AdminEmployeeDetail } from './pages/admin/AdminEmployeeDetail';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminLeaves } from './pages/admin/AdminLeaves';
import { AdminPayroll } from './pages/admin/AdminPayroll';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminNotifications } from './pages/admin/AdminNotifications';

// Role Guard Component
const ProtectedRoute: React.FC<{
  allowedRoles?: ('Employee' | 'Admin' | 'HR')[];
  children: React.ReactElement;
}> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 text-surface-500 text-sm">
        Initializing Dayflow workspace...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to permitted dashboard
    if (user.role === 'Admin' || user.role === 'HR') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

// Root Redirector
const RootRedirector: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Admin' || user.role === 'HR') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/employee/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirector />} />

              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Employee Protected Routes */}
              <Route
                path="/employee"
                element={
                  <ProtectedRoute allowedRoles={['Employee', 'Admin', 'HR']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/employee/dashboard" replace />} />
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="attendance" element={<EmployeeAttendance />} />
                <Route path="leave" element={<EmployeeLeave />} />
                <Route path="payroll" element={<EmployeePayroll />} />
                <Route path="notifications" element={<EmployeeNotifications />} />
              </Route>

              {/* Admin & HR Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'HR']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="employees" element={<AdminEmployees />} />
                <Route path="employees/:id" element={<AdminEmployeeDetail />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="leaves" element={<AdminLeaves />} />
                <Route path="payroll" element={<AdminPayroll />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
