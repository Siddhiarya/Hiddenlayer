const express = require('express');
const {
  getMe,
  updateMe,
  uploadAvatar,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
} = require('../controllers/employeeController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { uploadAvatar: uploadMiddleware } = require('../middleware/uploadMiddleware');
const {
  updateProfileMeValidation,
  updateEmployeeAdminValidation,
} = require('../utils/validators');

const router = express.Router();

// Current user profile routes
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfileMeValidation, validate, updateMe);
router.post('/me/avatar', authenticate, uploadMiddleware.single('avatar'), uploadAvatar);

// HR / Admin employee management routes
router.get('/', authenticate, authorizeRoles('hr', 'admin'), getAllEmployees);
router.get('/:id', authenticate, getEmployeeById);
router.put('/:id', authenticate, authorizeRoles('hr', 'admin'), updateEmployeeAdminValidation, validate, updateEmployeeById);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteEmployeeById);

module.exports = router;
