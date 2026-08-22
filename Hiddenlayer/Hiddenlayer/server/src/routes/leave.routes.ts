import { Router, Response } from 'express';
import { db } from '../models/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';

const router = Router();

// Get all leave requests
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const employeeId = req.query.employeeId as string | undefined;
  const isAdminOrHR = req.user?.role === 'Admin' || req.user?.role === 'HR';

  if (!isAdminOrHR && employeeId && employeeId !== req.user?.employeeId) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
  }

  const targetId = isAdminOrHR ? employeeId : req.user?.employeeId;
  const leaves = db.getLeaves(targetId);
  res.json({ success: true, count: leaves.length, leaves });
});

// Get current user's leave requests
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const leaves = db.getLeaves(req.user.employeeId);
  res.json({ success: true, count: leaves.length, leaves });
});

// Get leave balance for an employee
router.get('/balance/:employeeId', authenticate, (req: AuthRequest, res: Response): void => {
  const targetEmployeeId = req.params.employeeId;
  const isAdminOrHR = req.user?.role === 'Admin' || req.user?.role === 'HR';

  if (!isAdminOrHR && targetEmployeeId !== req.user?.employeeId) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
  }

  const balance = db.getLeaveBalance(targetEmployeeId);
  res.json({ success: true, balance });
});

// Apply for leave
router.post('/', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { leaveType, startDate, endDate, days, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !days || !reason) {
    res.status(400).json({ success: false, message: 'All leave fields are required' });
    return;
  }

  const newRequest = db.applyLeave({
    employeeId: req.user.employeeId,
    leaveType,
    startDate,
    endDate,
    days: Number(days),
    reason: reason.trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully',
    leave: newRequest,
  });
});

// Approve leave (Admin/HR only)
router.put('/:id/approve', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const { comment } = req.body;
  const approverName = req.user?.name || 'Administrator';
  const updated = db.approveLeave(req.params.id, approverName, comment);

  if (!updated) {
    res.status(404).json({ success: false, message: 'Leave request not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Leave request approved successfully',
    leave: updated,
  });
});

// Reject leave (Admin/HR only)
router.put('/:id/reject', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const { comment } = req.body;
  if (!comment || !comment.trim()) {
    res.status(400).json({ success: false, message: 'Rejection reason is required' });
    return;
  }

  const approverName = req.user?.name || 'Administrator';
  const updated = db.rejectLeave(req.params.id, approverName, comment.trim());

  if (!updated) {
    res.status(404).json({ success: false, message: 'Leave request not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Leave request rejected',
    leave: updated,
  });
});

// Cancel leave request
router.put('/:id/cancel', authenticate, (req: AuthRequest, res: Response): void => {
  const updated = db.cancelLeave(req.params.id);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Leave request not found' });
    return;
  }
  res.json({ success: true, message: 'Leave request cancelled', leave: updated });
});

export default router;
