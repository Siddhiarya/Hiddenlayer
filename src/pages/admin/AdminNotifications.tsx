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
  Shield,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useData();

  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'all') return notifications;
    return notifications.filter(n => n.category === selectedCategory);
  }, [notifications, selectedCategory]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Admin Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                {unreadCount} Action Items
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            System-wide operational alerts, leave requests, and compliance reminders.
          </p>
        </div>

        {unreadCount > 0 && (
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

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-surface-200/80 shadow-xs divide-y divide-surface-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Bell}
              title="No admin notifications"
              description="Everything is running smoothly! No outstanding operational alerts."
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
                  {notif.category === 'leave' ? (
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  ) : notif.category === 'payroll' ? (
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-primary-600" />
                  )}
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
                  title="Delete"
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
