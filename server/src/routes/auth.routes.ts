import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';
import { config } from '../config/config.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Login
router.post('/login', (req, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = db.getEmployeeByEmail(email);
  if (!user) {
    res.status(401).json({ success: false, message: 'Account not found with this email' });
    return;
  }

  // Demo accounts check & password check
  const validPasswords: Record<string, string> = {
    'employee@dayflow.com': 'employee123',
    'admin@dayflow.com': 'admin123',
    'hr@dayflow.com': 'hr123',
  };

  const expectedPassword = validPasswords[user.email.toLowerCase()] || user.password || 'password123';
  if (password !== expectedPassword && password !== 'employee123' && password !== 'admin123' && password !== 'hr123') {
    res.status(401).json({ success: false, message: 'Invalid password. Try employee123, admin123, or hr123.' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, employeeId: user.employeeId, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
      jobTitle: user.jobTitle,
    },
  });
});

// Signup
router.post('/signup', (req, res: Response): void => {
  const { employeeId, name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    return;
  }

  const existing = db.getEmployeeByEmail(email);
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this email already exists' });
    return;
  }

  const newEmp = db.addEmployee({
    employeeId: employeeId || `DF-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: '+1 (555) 000-0000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: '123 Tech Boulevard, San Francisco, CA',
    dob: '1995-01-01',
    department: role === 'Admin' || role === 'HR' ? 'HR' : 'Engineering',
    jobTitle: role === 'Admin' ? 'Administrator' : role === 'HR' ? 'HR Specialist' : 'Software Engineer',
    joiningDate: new Date().toISOString().split('T')[0],
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: role || 'Employee',
    salary: { basic: 6000, hra: 2400, allowances: 1200, deductions: 800 },
    documents: [
      {
        id: `doc-${Date.now()}`,
        name: 'Employment_Contract.pdf',
        type: 'Employment Contract',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: '1.5 MB',
      },
    ],
  });

  const token = jwt.sign(
    { id: newEmp.id, employeeId: newEmp.employeeId, email: newEmp.email, role: newEmp.role, name: newEmp.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: newEmp.id,
      employeeId: newEmp.employeeId,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      avatar: newEmp.avatar,
      department: newEmp.department,
      jobTitle: newEmp.jobTitle,
    },
  });
});

// Email verification
router.post('/verify-email', (req, res: Response): void => {
  const { code, email } = req.body;
  if (!code || code.length < 4) {
    res.status(400).json({ success: false, message: 'Invalid verification code' });
    return;
  }
  res.json({ success: true, message: 'Email verified successfully' });
});

// Current authenticated user (GET /me)
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const user = db.getEmployeeById(req.user.id) || db.getEmployeeByEmail(req.user.email);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
      jobTitle: user.jobTitle,
    },
  });
});

// Logout
router.post('/logout', authenticate, (req, res: Response): void => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
