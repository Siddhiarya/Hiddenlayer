import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Clock, 
  Calendar,
  Layers, 
  Menu,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left side: Brand / Mobile menu button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/employee/dashboard')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-sm shadow-brand-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold text-slate-900 tracking-tight">Dayflow</span>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 border border-brand-200/60">HRMS</span>
            </div>
            <p className="hidden text-[10px] font-medium text-slate-400 sm:block leading-none">Every workday, perfectly aligned.</p>
          </div>
        </div>
      </div>

      {/* Center: Live clock & date badge */}
      <div className="hidden md:flex items-center space-x-4 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/70 text-xs text-slate-600">
        <div className="flex items-center space-x-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5 text-brand-600" />
          <span>{currentDate}</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-mono">{currentTime}</span>
        </div>
      </div>

      {/* Right side: Employee Profile & Logout */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2.5 rounded-full bg-slate-50 p-1.5 pr-3 text-left hover:bg-slate-100 transition-colors border border-slate-200/70 focus:outline-none"
          >
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0284c7&color=fff`}
              alt={user?.name}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user?.employeeId} • {user?.department}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200/60 uppercase tracking-wider">
                  {user?.role} Portal
                </span>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/employee/profile');
                }}
                className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors mt-1"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
