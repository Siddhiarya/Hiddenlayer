import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  CalendarCheck, 
  CalendarDays, 
  CreditCard, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      to: '/employee/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      to: '/employee/profile',
      label: 'My Profile',
      icon: UserCircle,
      badge: undefined
    },
    {
      to: '/employee/attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      badge: 'Live'
    },
    {
      to: '/employee/leaves',
      label: 'Leave Requests',
      icon: CalendarDays,
      badge: undefined
    },
    {
      to: '/employee/payroll',
      label: 'Salary & Payroll',
      icon: CreditCard,
      badge: undefined
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex h-16 items-center px-6 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20">
                D
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight">Dayflow HRMS</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Employee Space</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-bold'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-800/60 p-3 mb-3 border border-slate-700/50">
            <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Role: {user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 font-mono">ID: {user?.employeeId}</p>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
