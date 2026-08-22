import { Router, Response } from 'express';
import { db } from '../models/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user's notifications
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const notifications = db.getNotifications(req.user.employeeId);
  const unreadCount = notifications.filter(n => !n.read).length;
  res.json({ success: true, count: notifications.length, unreadCount, notifications });
});

// Get all notifications (Admin)
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const notifications = db.getAllNotifications();
  res.json({ success: true, count: notifications.length, notifications });
});

// Mark single notification as read
router.put('/:id/read', authenticate, (req: AuthRequest, res: Response): void => {
  const success = db.markNotificationAsRead(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Notification not found' });
    return;
  }
  res.json({ success: true, message: 'Notification marked as read' });
});

// Mark all as read
router.put('/read-all', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  db.markAllNotificationsAsRead(req.user.employeeId);
  res.json({ success: true, message: 'All notifications marked as read' });
});

// Delete notification
router.delete('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const success = db.deleteNotification(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Notification not found' });
    return;
  }
  res.json({ success: true, message: 'Notification deleted' });
});

export default router;
