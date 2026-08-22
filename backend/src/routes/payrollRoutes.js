const express = require('express');
const {
  getMyPayroll,
  getAllPayrolls,
  getEmployeePayroll,
  updateSalaryStructure,
  generatePayroll,
} = require('../controllers/payrollController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  updateSalaryStructureValidation,
  generatePayrollValidation,
} = require('../utils/validators');

const router = express.Router();

// Employee payroll route
router.get('/me', authenticate, getMyPayroll);

// HR / Admin payroll routes
router.get('/', authenticate, authorizeRoles('hr', 'admin'), getAllPayrolls);
router.get('/employee/:employeeId', authenticate, authorizeRoles('hr', 'admin'), getEmployeePayroll);
router.put('/employee/:employeeId', authenticate, authorizeRoles('hr', 'admin'), updateSalaryStructureValidation, validate, updateSalaryStructure);
router.post('/generate', authenticate, authorizeRoles('hr', 'admin'), generatePayrollValidation, validate, generatePayroll);

module.exports = router;
