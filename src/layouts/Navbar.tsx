import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  Shield,
  Check,
  Trash2,
  Calendar,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';

export interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenCommandPalette,
}) => {
  const { user, logout, switchUser } = useAuth();
  const {
    todayUserAttendance,
    checkIn,
    checkOut,
    userNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useData();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(currentTime);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(currentTime);

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-md border-b border-surface-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Search palette trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-surface-600 hover:bg-surface-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-surface-100/80 hover:bg-surface-200/80 text-surface-500 hover:text-surface-800 transition-all border border-surface-200/60 w-44 sm:w-64 md:w-80 group text-left"
        >
          <Search className="w-4 h-4 text-surface-400 group-hover:text-primary-600 transition-colors shrink-0" />
          <span className="text-xs truncate flex-1">Search or jump to...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-surface-300 rounded shadow-2xs text-surface-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Date/Clock, Attendance Quick Action, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Date & Time Indicator */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-bold text-surface-800 leading-tight">
            {formattedDate}
          </span>
          <span className="text-[11px] font-mono text-surface-500">
            {formattedTime}
          </span>
        </div>

        {/* Employee Check-In Quick Pill (if employee) */}
        {!isAdminOrHR && (
          <div className="hidden sm:flex items-center">
            {!todayUserAttendance?.checkIn ? (
              <button
                onClick={checkIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200/80 transition-all active:scale-95 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Check In</span>
              </button>
            ) : !todayUserAttendance?.checkOut ? (
              <button
                onClick={checkOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200/80 transition-all active:scale-95 shadow-2xs"
              >
                <Clock className="w-4 h-4 text-amber-600 animate-pulse-subtle" />
                <span>In: {todayUserAttendance.checkIn}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-100 text-surface-600 text-xs font-medium border border-surface-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logged 8.5h</span>
              </span>
            )}
          </div>
        )}

        <div className="h-6 w-px bg-surface-200 hidden sm:block" />

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-surface-200/80 shadow-2xl z-50 overflow-hidden animate-slide-up">
              <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/60">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-surface-900">Notifications</h4>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-100">
                {userNotifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-surface-500">
                    No notifications yet
                  </div>
                ) : (
                  userNotifications.slice(0, 6).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.link) {
                          navigate(notif.link);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-3.5 flex items-start gap-3 hover:bg-surface-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0 text-surface-500 mt-0.5">
                        {notif.category === 'leave' ? (
                          <Calendar className="w-4 h-4 text-indigo-500" />
                        ) : notif.category === 'payroll' ? (
                          <CreditCard className="w-4 h-4 text-emerald-500" />
                        ) : notif.category === 'attendance' ? (
                          <Clock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Bell className="w-4 h-4 text-primary-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs font-semibold text-surface-900 truncate ${
                              !notif.read ? 'text-primary-950 font-bold' : ''
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-surface-400 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-surface-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="text-surface-300 hover:text-rose-500 p-1 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-surface-100 bg-surface-50/50 text-center">
                <button
                  onClick={() => {
                    navigate(isAdminOrHR ? '/admin/notifications' : '/employee/notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 py-1"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface-100 transition-colors"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name || 'User'}
              size="md"
              status="online"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-surface-900 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] text-surface-500">
                {user?.department}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-surface-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-surface-200/80 shadow-2xl z-50 p-2 divide-y divide-surface-100 animate-slide-up">
              {/* Header Details */}
              <div className="p-3">
                <p className="text-sm font-bold text-surface-900">{user?.name}</p>
                <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={user?.role === 'Admin' ? 'admin' : user?.role === 'HR' ? 'hr' : 'employee'} size="sm">
                    {user?.role} Access
                  </Badge>
                  <span className="text-[10px] font-mono text-surface-400">
                    {user?.employeeId}
                  </span>
                </div>
              </div>

              {/* Quick Profile Navigation */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate(isAdminOrHR ? '/admin/dashboard' : '/employee/profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  <User className="w-4 h-4 text-surface-400" />
                  <span>{isAdminOrHR ? 'Admin Console' : 'My Profile'}</span>
                </button>
              </div>

              {/* Switch Demo Personas */}
              <div className="py-2">
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider px-3">
                  Switch Persona:
                </span>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      switchUser('DF-1001');
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${
                      user?.employeeId === 'DF-1001'
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    <span>Alex Morgan (Employee)</span>
                    {user?.employeeId === 'DF-1001' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      switchUser('DF-1002');
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${
                      user?.employeeId === 'DF-1002'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    <span>Sarah Jenkins (Admin)</span>
                    {user?.employeeId === 'DF-1002' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      switchUser('DF-1003');
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${
                      user?.employeeId === 'DF-1003'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    <span>Marcus Vance (HR)</span>
                    {user?.employeeId === 'DF-1003' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
