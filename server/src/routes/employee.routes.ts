import { Router, Response } from 'express';
import { db, Employee } from '../models/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';

const router = Router();

// Get all employees
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const employees = db.getEmployees().map(e => {
    const { password, ...safeEmp } = e;
    return safeEmp;
  });
  res.json({ success: true, count: employees.length, employees });
});

// Get current employee profile
router.get('/me/profile', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const emp = db.getEmployeeById(req.user.id) || db.getEmployeeByEmail(req.user.email);
  if (!emp) {
    res.status(404).json({ success: false, message: 'Employee profile not found' });
    return;
  }

  const { password, ...safeEmp } = emp;
  res.json({ success: true, employee: safeEmp });
});

// Get employee by ID
router.get('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const emp = db.getEmployeeById(req.params.id);
  if (!emp) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  const { password, ...safeEmp } = emp;
  res.json({ success: true, employee: safeEmp });
});

// Add new employee (Admin/HR only)
router.post('/', authenticate, requireRoles(['Admin', 'HR']), (req: AuthRequest, res: Response): void => {
  const { name, email, department, jobTitle } = req.body;

  if (!name || !email || !department || !jobTitle) {
    res.status(400).json({ success: false, message: 'Name, email, department, and job title are required' });
    return;
  }

  const existing = db.getEmployeeByEmail(email);
  if (existing) {
    res.status(409).json({ success: false, message: 'An employee with this email already exists' });
    return;
  }

  const newEmp = db.addEmployee({
    employeeId: req.body.employeeId || `DF-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: req.body.phone || '+1 (555) 000-0000',
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: req.body.address || '123 Main St, San Francisco, CA',
    dob: req.body.dob || '1995-01-01',
    department,
    jobTitle,
    joiningDate: req.body.joiningDate || new Date().toISOString().split('T')[0],
    manager: req.body.manager || 'Sarah Jenkins',
    employmentType: req.body.employmentType || 'Full-Time',
    status: req.body.status || 'Active',
    role: req.body.role || 'Employee',
    salary: req.body.salary || { basic: 5000, hra: 2000, allowances: 1000, deductions: 700 },
    documents: req.body.documents || [
      {
        id: `doc-${Date.now()}`,
        name: 'Offer_Letter.pdf',
        type: 'Offer Letter',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: '1.2 MB',
      },
    ],
  });

  const { password, ...safeEmp } = newEmp;
  res.status(201).json({ success: true, message: 'Employee added successfully', employee: safeEmp });
});

// Update employee
router.put('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const targetId = req.params.id;
  const currentEmp = db.getEmployeeById(targetId);

  if (!currentEmp) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }

  const isAdminOrHR = req.user?.role === 'Admin' || req.user?.role === 'HR';
  const isSelf = req.user?.id === currentEmp.id || req.user?.employeeId === currentEmp.employeeId;

  if (!isAdminOrHR && !isSelf) {
    res.status(403).json({ success: false, message: 'You do not have permission to update this employee' });
    return;
  }

  // If regular employee, only allow updating safe fields
  let updates: Partial<Employee> = {};
  if (isAdminOrHR) {
    updates = req.body;
  } else {
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;
  }

  const updated = db.updateEmployee(targetId, updates);
  if (!updated) {
    res.status(500).json({ success: false, message: 'Failed to update employee' });
    return;
  }

  const { password, ...safeEmp } = updated;
  res.json({ success: true, message: 'Employee updated successfully', employee: safeEmp });
});

// Delete employee (Admin only)
router.delete('/:id', authenticate, requireRoles(['Admin']), (req: AuthRequest, res: Response): void => {
  const success = db.deleteEmployee(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return;
  }
  res.json({ success: true, message: 'Employee removed successfully' });
});

export default router;
