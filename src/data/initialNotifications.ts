import { AppNotification } from '../types/notification';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'DF-1001',
    title: 'Salary Slip Available',
    message: 'Your salary slip for September 2026 has been generated and is ready for download.',
    category: 'payroll',
    timestamp: '2 hours ago',
    read: false,
    link: '/employee/payroll'
  },
  {
    id: 'notif-2',
    userId: 'DF-1001',
    title: 'Attendance Reminder',
    message: 'Don’t forget to check out at the end of your workday.',
    category: 'attendance',
    timestamp: '4 hours ago',
    read: false,
    link: '/employee/attendance'
  },
  {
    id: 'notif-3',
    userId: 'DF-1001',
    title: 'Leave Policy Update',
    message: 'Annual leave rollover policy has been updated for Q4 2026.',
    category: 'system',
    timestamp: '1 day ago',
    read: true,
    link: '/employee/leave'
  },
  {
    id: 'notif-4',
    userId: 'DF-1001',
    title: 'Sick Leave Approved',
    message: 'Your sick leave request for Sep 02 - Sep 03 was approved by Sarah Jenkins.',
    category: 'leave',
    timestamp: '2 weeks ago',
    read: true,
    link: '/employee/leave'
  },
  {
    id: 'notif-admin-1',
    userId: 'DF-1002',
    title: 'New Leave Request',
    message: 'Alex Morgan submitted a Paid Leave request for Oct 20 - Oct 22 (3 days).',
    category: 'leave',
    timestamp: '30 mins ago',
    read: false,
    link: '/admin/leaves'
  },
  {
    id: 'notif-admin-2',
    userId: 'DF-1002',
    title: 'New Leave Request',
    message: 'Priya Sharma submitted a Sick Leave request for Oct 18 - Oct 19 (2 days).',
    category: 'leave',
    timestamp: '1 hour ago',
    read: false,
    link: '/admin/leaves'
  },
  {
    id: 'notif-admin-3',
    userId: 'DF-1002',
    title: 'Monthly Payroll Processed',
    message: 'September 2026 payroll has been successfully processed for 20 employees.',
    category: 'payroll',
    timestamp: '2 days ago',
    read: true,
    link: '/admin/payroll'
  }
];
