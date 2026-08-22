import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  CreditCard,
  BarChart3,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
  badgeVariant?: 'amber' | 'primary';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout, switchUser } = useAuth();
  const { leaveRequests, unreadNotificationCount, resetToDefaultData } = useData();
  const navigate = useNavigate();

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;

  const employeeLinks: NavItem[] = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/employee/profile', icon: User },
    { name: 'Attendance', path: '/employee/attendance', icon: Clock },
    { name: 'Leave / Time Off', path: '/employee/leave', icon: Calendar },
    { name: 'Payroll & Slips', path: '/employee/payroll', icon: CreditCard },
    {
      name: 'Notifications',
      path: '/employee/notifications',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
  ];

  const adminLinks: NavItem[] = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Attendance', path: '/admin/attendance', icon: Clock },
    {
      name: 'Leave Requests',
      path: '/admin/leaves',
      icon: Calendar,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeVariant: 'amber',
    },
    { name: 'Payroll Mgmt', path: '/admin/payroll', icon: CreditCard },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
  ];

  const links = isAdminOrHR ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-surface-200/80 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-surface-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight text-surface-900 leading-tight">
                DAYFLOW
              </span>
              <span className="text-[10px] font-medium text-surface-500 truncate">
                HR Management System
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Indicator Banner */}
      {(!isCollapsed || isMobileOpen) && (
        <div className="px-4 pt-3">
          <div className="px-3 py-2 rounded-xl bg-surface-50 border border-surface-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-600">Portal:</span>
              <Badge variant={user?.role === 'Admin' ? 'admin' : user?.role === 'HR' ? 'hr' : 'employee'} size="sm">
                {user?.role || 'Employee'}
              </Badge>
            </div>
            {/* Quick Role Switcher */}
            <div className="flex gap-1">
              <button
                title="Switch to Employee (Alex)"
                onClick={() => switchUser('DF-1001')}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
                  user?.role === 'Employee'
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-200 text-surface-600 hover:bg-surface-300'
                }`}
              >
                EMP
              </button>
              <button
                title="Switch to Admin (Sarah)"
                onClick={() => switchUser('DF-1002')}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
                  user?.role === 'Admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-surface-200 text-surface-600 hover:bg-surface-300'
                }`}
              >
                ADM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed && !isMobileOpen ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeVariant === 'amber'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {/* Indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary-600 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / User Profile Card */}
      <div className="p-3 border-t border-surface-100 space-y-2 bg-surface-50/40">
        {(!isCollapsed || isMobileOpen) ? (
          <div className="p-2.5 rounded-xl bg-white border border-surface-200/80 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={user?.avatar}
                name={user?.name || 'User'}
                size="sm"
                status="online"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-surface-900 truncate">
                  {user?.name}
                </span>
                <span className="text-[10px] text-surface-500 truncate">
                  {user?.jobTitle}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src={user?.avatar}
              name={user?.name || 'User'}
              size="sm"
              status="online"
            />
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reset Mock Data Utility & Collapse Button */}
        <div className="flex items-center justify-between pt-1">
          {(!isCollapsed || isMobileOpen) && (
            <button
              onClick={resetToDefaultData}
              title="Reset all local demo changes"
              className="text-[10px] text-surface-400 hover:text-surface-600 flex items-center gap-1 transition-colors px-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Demo
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors ml-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white animate-slide-up shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
