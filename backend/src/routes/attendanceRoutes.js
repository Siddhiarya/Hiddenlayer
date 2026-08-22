const express = require('express');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getMyWeeklyAttendance,
  getAllAttendance,
  getEmployeeAttendance,
  updateAttendance,
} = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  checkInValidation,
  checkOutValidation,
  updateAttendanceValidation,
} = require('../utils/validators');

const router = express.Router();

// Employee attendance routes
router.post('/check-in', authenticate, checkInValidation, validate, checkIn);
router.post('/check-out', authenticate, checkOutValidation, validate, checkOut);
router.get('/me', authenticate, getMyAttendance);
router.get('/me/weekly', authenticate, getMyWeeklyAttendance);

// HR / Admin attendance management routes
router.get('/', authenticate, authorizeRoles('hr', 'admin'), getAllAttendance);
router.get('/employee/:employeeId', authenticate, authorizeRoles('hr', 'admin'), getEmployeeAttendance);
router.put('/:id', authenticate, authorizeRoles('hr', 'admin'), updateAttendanceValidation, validate, updateAttendance);

module.exports = router;
