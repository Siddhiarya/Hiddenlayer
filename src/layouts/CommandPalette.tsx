import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Calendar,
  CreditCard,
  FileText,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, leaveRequests, checkIn, checkOut, todayUserAttendance } = useData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clean query on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  // Search Results Categorization
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const pages = isAdminOrHR
      ? [
          { title: 'Admin Dashboard', path: '/admin/dashboard', icon: FileText, category: 'Navigation' },
          { title: 'Employee Directory', path: '/admin/employees', icon: Users, category: 'Navigation' },
          { title: 'Attendance Management', path: '/admin/attendance', icon: Clock, category: 'Navigation' },
          { title: 'Leave Approvals', path: '/admin/leaves', icon: Calendar, category: 'Navigation' },
          { title: 'Payroll Administration', path: '/admin/payroll', icon: CreditCard, category: 'Navigation' },
          { title: 'Reports & Analytics', path: '/admin/reports', icon: FileText, category: 'Navigation' },
          { title: 'Admin Notifications', path: '/admin/notifications', icon: Clock, category: 'Navigation' },
        ]
      : [
          { title: 'My Dashboard', path: '/employee/dashboard', icon: FileText, category: 'Navigation' },
          { title: 'My Profile', path: '/employee/profile', icon: User, category: 'Navigation' },
          { title: 'My Attendance Logs', path: '/employee/attendance', icon: Clock, category: 'Navigation' },
          { title: 'My Leave Applications', path: '/employee/leave', icon: Calendar, category: 'Navigation' },
          { title: 'My Payroll & Payslips', path: '/employee/payroll', icon: CreditCard, category: 'Navigation' },
          { title: 'My Notifications', path: '/employee/notifications', icon: Clock, category: 'Navigation' },
        ];

    const matchedPages = pages.filter(p => p.title.toLowerCase().includes(q));

    const matchedEmployees = isAdminOrHR
      ? employees
          .filter(
            e =>
              e.name.toLowerCase().includes(q) ||
              e.employeeId.toLowerCase().includes(q) ||
              e.department.toLowerCase().includes(q) ||
              e.jobTitle.toLowerCase().includes(q)
          )
          .slice(0, 5)
          .map(e => ({
            title: `${e.name} (${e.employeeId})`,
            subtitle: `${e.jobTitle} • ${e.department}`,
            path: `/admin/employees/${e.id}`,
            icon: User,
            category: 'Employees',
          }))
      : [];

    const matchedLeaves = leaveRequests
      .filter(l =>
        isAdminOrHR
          ? l.employeeName.toLowerCase().includes(q) || l.reason.toLowerCase().includes(q)
          : l.employeeId === user?.employeeId && (l.reason.toLowerCase().includes(q) || l.leaveType.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map(l => ({
        title: `${l.employeeName}: ${l.leaveType} Leave (${l.days} days)`,
        subtitle: `${l.startDate} to ${l.endDate} — Status: ${l.status}`,
        path: isAdminOrHR ? '/admin/leaves' : '/employee/leave',
        icon: Calendar,
        category: 'Leave Requests',
      }));

    return {
      pages: matchedPages,
      employees: matchedEmployees,
      leaves: matchedLeaves,
    };
  }, [query, isAdminOrHR, employees, leaveRequests, user]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const hasAnyResults =
    results.pages.length > 0 ||
    results.employees.length > 0 ||
    results.leaves.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl border border-surface-200 ring-1 ring-black/5 transition-all animate-slide-up">
        {/* Search Bar */}
        <div className="relative flex items-center border-b border-surface-100 px-4 py-3.5 bg-surface-50/50">
          <Search className="w-5 h-5 text-primary-600 mr-3 shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-sm sm:text-base text-surface-900 placeholder:text-surface-400 focus:outline-none"
            placeholder="Type a command, employee name, page, or request..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions Header */}
        {!query && (
          <div className="p-3 border-b border-surface-100 bg-surface-50/30 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider px-2">
              Quick:
            </span>
            {!isAdminOrHR && (
              <>
                {!todayUserAttendance?.checkIn ? (
                  <button
                    onClick={() => {
                      checkIn();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200/80"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Check In Now
                  </button>
                ) : !todayUserAttendance?.checkOut ? (
                  <button
                    onClick={() => {
                      checkOut();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors border border-amber-200/80"
                  >
                    <Clock className="w-3.5 h-3.5" /> Check Out
                  </button>
                ) : null}
                <button
                  onClick={() => handleSelect('/employee/leave')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors border border-primary-200/80"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Apply Leave
                </button>
              </>
            )}
            {isAdminOrHR && (
              <>
                <button
                  onClick={() => handleSelect('/admin/leaves')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors border border-amber-200/80"
                >
                  <Calendar className="w-3.5 h-3.5" /> Review Leaves
                </button>
                <button
                  onClick={() => handleSelect('/admin/employees')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors border border-primary-200/80"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> View Employees
                </button>
              </>
            )}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {!hasAnyResults ? (
            <div className="p-8 text-center text-xs text-surface-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Pages */}
              {results.pages.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                    Pages
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {results.pages.map(page => (
                      <button
                        key={page.path}
                        onClick={() => handleSelect(page.path)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-primary-50 hover:text-primary-900 group transition-colors text-xs sm:text-sm text-surface-800"
                      >
                        <div className="flex items-center gap-3">
                          <page.icon className="w-4 h-4 text-surface-400 group-hover:text-primary-600" />
                          <span className="font-medium">{page.title}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Employees */}
              {results.employees.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                    Employees
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {results.employees.map(emp => (
                      <button
                        key={emp.path}
                        onClick={() => handleSelect(emp.path)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-primary-50 hover:text-primary-900 group transition-colors text-xs sm:text-sm text-surface-800"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-surface-400 group-hover:text-primary-600" />
                          <div>
                            <p className="font-medium leading-none">{emp.title}</p>
                            <p className="text-[11px] text-surface-500 mt-1">{emp.subtitle}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Leaves */}
              {results.leaves.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                    Leaves & Time-Off
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {results.leaves.map((leave, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(leave.path)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-primary-50 hover:text-primary-900 group transition-colors text-xs sm:text-sm text-surface-800"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-surface-400 group-hover:text-primary-600" />
                          <div>
                            <p className="font-medium leading-none">{leave.title}</p>
                            <p className="text-[11px] text-surface-500 mt-1">{leave.subtitle}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 border-t border-surface-100 bg-surface-50/70 flex items-center justify-between text-[11px] text-surface-500">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono text-[10px]">↓</kbd></span>
            <span>Select: <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono text-[10px]">↵</kbd></span>
          </div>
          <span>Close: <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono text-[10px]">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
