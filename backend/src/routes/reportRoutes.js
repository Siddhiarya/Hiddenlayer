const express = require('express');
const {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getEmployeeSummaryReport,
} = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Reports are restricted to HR and Admin
router.get('/attendance', authenticate, authorizeRoles('hr', 'admin'), getAttendanceReport);
router.get('/leave', authenticate, authorizeRoles('hr', 'admin'), getLeaveReport);
router.get('/payroll', authenticate, authorizeRoles('hr', 'admin'), getPayrollReport);
router.get('/employee-summary', authenticate, authorizeRoles('hr', 'admin'), getEmployeeSummaryReport);

module.exports = router;
