import { Router, Response } from 'express';
import { db } from '../models/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';

const router = Router();

// Get all payslips / payroll records
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const employeeId = req.query.employeeId as string | undefined;
  const isAdminOrHR = req.user?.role === 'Admin' || req.user?.role === 'HR';

  if (!isAdminOrHR && employeeId && employeeId !== req.user?.employeeId) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
  }

  const targetId = isAdminOrHR ? employeeId : req.user?.employeeId;
  const payroll = db.getPayroll(targetId);
  res.json({ success: true, count: payroll.length, payroll });
});

// Get current user's payslips
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const payroll = db.getPayroll(req.user.employeeId);
  res.json({ success: true, count: payroll.length, payroll });
});

// Update employee salary structure (Admin/HR only)
router.put('/:employeeId/salary', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const { basic, hra, allowances, deductions } = req.body;

  if (basic === undefined || hra === undefined || allowances === undefined || deductions === undefined) {
    res.status(400).json({ success: false, message: 'Basic, HRA, allowances, and deductions are required' });
    return;
  }

  const updatedEmp = db.updateEmployeeSalary(req.params.employeeId, {
    basic: Number(basic),
    hra: Number(hra),
    allowances: Number(allowances),
    deductions: Number(deductions),
  });

  if (!updatedEmp) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  const { password, ...safeEmp } = updatedEmp;
  res.json({
    success: true,
    message: 'Salary structure updated successfully',
    employee: safeEmp,
  });
});

export default router;
