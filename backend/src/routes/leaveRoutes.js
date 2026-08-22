const express = require('express');
const {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  deleteLeave,
  getAllLeaves,
  updateLeaveStatus,
  approveLeave,
  rejectLeave,
} = require('../controllers/leaveController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  applyLeaveValidation,
  leaveStatusValidation,
} = require('../utils/validators');

const router = express.Router();

// Employee leave routes
router.post('/', authenticate, applyLeaveValidation, validate, applyLeave);
router.get('/me', authenticate, getMyLeaves);
router.get('/:id', authenticate, getLeaveById);
router.delete('/:id', authenticate, deleteLeave);

// HR / Admin leave management routes
router.get('/', authenticate, authorizeRoles('hr', 'admin'), getAllLeaves);
router.put('/:id/status', authenticate, authorizeRoles('hr', 'admin'), leaveStatusValidation, validate, updateLeaveStatus);
router.put('/:id/approve', authenticate, authorizeRoles('hr', 'admin'), approveLeave);
router.put('/:id/reject', authenticate, authorizeRoles('hr', 'admin'), rejectLeave);

module.exports = router;
