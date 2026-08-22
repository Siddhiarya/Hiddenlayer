export type NotificationCategory = 'attendance' | 'leave' | 'payroll' | 'system';

export interface AppNotification {
  id: string;
  userId: string; // 'all' or specific employeeId
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string; // e.g. "10 mins ago" or ISO
  read: boolean;
  link?: string;
}
