import { Router, Response } from 'express';
import { db } from '../models/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';

const router = Router();

// Get all attendance records (Admin/HR gets all, or by employeeId)
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const employeeId = req.query.employeeId as string | undefined;
  const isAdminOrHR = req.user?.role === 'Admin' || req.user?.role === 'HR';

  if (!isAdminOrHR && employeeId && employeeId !== req.user?.employeeId) {
    res.status(403).json({ success: false, message: 'You can only view your own attendance' });
    return;
  }

  const targetId = isAdminOrHR ? employeeId : req.user?.employeeId;
  const records = db.getAttendance(targetId);
  res.json({ success: true, count: records.length, attendance: records });
});

// Get current user's attendance
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const records = db.getAttendance(req.user.employeeId);
  res.json({ success: true, count: records.length, attendance: records });
});

// Get current user's today status
router.get('/today', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const record = db.getTodayAttendance(req.user.employeeId);
  res.json({ success: true, attendance: record });
});

// Check In
router.post('/check-in', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const record = db.checkIn(req.user.employeeId);
  res.json({ success: true, message: 'Checked in successfully', attendance: record });
});

// Check Out
router.post('/check-out', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const record = db.checkOut(req.user.employeeId);
  if (!record) {
    res.status(400).json({ success: false, message: 'No active check-in found for today' });
    return;
  }

  res.json({ success: true, message: 'Checked out successfully', attendance: record });
});

// Get Attendance Summary (KPIs)
router.get('/summary', authenticate, (req: AuthRequest, res: Response): void => {
  const summary = db.getAttendanceSummary();
  res.json({ success: true, summary });
});

export default router;
