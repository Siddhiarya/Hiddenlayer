import { Router, Response } from 'express';
import { db } from '../models/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';

const router = Router();

// Get Attendance Report
router.get('/attendance', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const attendance = db.getAttendance();
  const summary = db.getAttendanceSummary();
  res.json({ success: true, summary, attendance });
});

// Get Leave Report
router.get('/leave', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const leaves = db.getLeaves();
  const approved = leaves.filter(l => l.status === 'Approved');
  const pending = leaves.filter(l => l.status === 'Pending');
  const rejected = leaves.filter(l => l.status === 'Rejected');
  res.json({ success: true, count: leaves.length, approvedCount: approved.length, pendingCount: pending.length, rejectedCount: rejected.length, leaves });
});

// Get Payroll Report
router.get('/payroll', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const employees = db.getEmployees();
  let totalGross = 0;
  let totalNet = 0;
  let totalDeductions = 0;

  const breakdown = employees.map(e => {
    const gross = e.salary.basic + e.salary.hra + e.salary.allowances;
    const net = Math.max(0, gross - e.salary.deductions);
    totalGross += gross;
    totalNet += net;
    totalDeductions += e.salary.deductions;
    return {
      employeeId: e.employeeId,
      name: e.name,
      department: e.department,
      basic: e.salary.basic,
      hra: e.salary.hra,
      allowances: e.salary.allowances,
      deductions: e.salary.deductions,
      grossSalary: gross,
      netSalary: net,
    };
  });

  res.json({
    success: true,
    totalGross,
    totalNet,
    totalDeductions,
    employeeCount: employees.length,
    breakdown,
  });
});

// Get General Summary
router.get('/summary', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const employees = db.getEmployees();
  const attendanceSummary = db.getAttendanceSummary();
  const leaves = db.getLeaves();
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  res.json({
    success: true,
    totalEmployees: employees.length,
    attendanceSummary,
    pendingLeavesCount: pendingLeaves,
  });
});

export default router;
