import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  Clock,
  Info,
  Filter,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { NotificationCategory } from '../../types/notification';

export const EmployeeNotifications: React.FC = () => {
  const {
    userNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useData();

  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'all') return userNotifications;
    return userNotifications.filter(n => n.category === selectedCategory);
  }, [userNotifications, selectedCategory]);

  const categories: { key: string; label: string; count?: number }[] = [
    { key: 'all', label: 'All Notifications', count: userNotifications.length },
    {
      key: 'attendance',
      label: 'Attendance',
      count: userNotifications.filter(n => n.category === 'attendance').length,
    },
    {
      key: 'leave',
      label: 'Leave & Time-Off',
      count: userNotifications.filter(n => n.category === 'leave').length,
    },
    {
      key: 'payroll',
      label: 'Payroll & Slips',
      count: userNotifications.filter(n => n.category === 'payroll').length,
    },
    {
      key: 'system',
      label: 'System & Policy',
      count: userNotifications.filter(n => n.category === 'system').length,
    },
  ];

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'leave':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'payroll':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'attendance':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-primary-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Notifications & Alerts
            </h1>
            {unreadNotificationCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full">
                {unreadNotificationCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Stay updated with leave status approvals, payroll generations, and reminders.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllNotificationsAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === cat.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            <span>{cat.label}</span>
            {cat.count !== undefined && cat.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.key
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-surface-100 text-surface-600'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-surface-200/80 shadow-xs divide-y divide-surface-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Bell}
              title="No notifications in this category"
              description="You're all caught up! No recent alerts or system updates."
            />
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`p-5 flex items-start justify-between gap-4 hover:bg-surface-50 cursor-pointer transition-colors ${
                !notif.read ? 'bg-primary-50/20' : ''
              }`}
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-surface-100 flex items-center justify-center shrink-0 mt-0.5 border border-surface-200/60">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm font-bold truncate ${
                        !notif.read ? 'text-primary-950 font-extrabold' : 'text-surface-900'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <Badge variant="neutral" size="sm">
                      {notif.category}
                    </Badge>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-surface-400 font-medium block pt-0.5">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      markNotificationAsRead(notif.id);
                    }}
                    className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1.5 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
