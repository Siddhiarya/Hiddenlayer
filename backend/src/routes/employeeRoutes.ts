import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  checkIn,
  checkOut,
  getAttendance,
  getWeeklyAttendance,
  deleteTodayAttendance,
  getLeaves,
  applyLeave,
  getPayroll
} from '../controllers/employeeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all employee routes with JWT authentication
router.use(authenticateToken);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Attendance
router.post('/attendance/check-in', checkIn);
router.post('/attendance/check-out', checkOut);
router.delete('/attendance/today', deleteTodayAttendance);
router.get('/attendance', getAttendance);
router.get('/attendance/weekly', getWeeklyAttendance);

// Leaves
router.get('/leaves', getLeaves);
router.post('/leaves', applyLeave);

// Payroll (Read Only)
router.get('/payroll', getPayroll);

export default router;
