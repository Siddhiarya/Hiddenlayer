const { body, param, query } = require('express-validator');

// Auth validation rules
const registerValidation = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Employee ID must be between 2 and 20 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['employee', 'hr'])
    .withMessage('Role must be either employee or hr. Admin cannot be self-registered.'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const emailValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  param('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (value && value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

// Profile update for self (Employee)
const updateProfileMeValidation = [
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (!/^\+?[0-9\s\-().]{7,20}$/.test(value)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  body('address')
    .optional(),
  body('gender')
    .optional({ values: 'falsy' })
    .isIn(['male', 'female', 'other', 'prefer_not_to_say', ''])
    .withMessage('Invalid gender value'),
  body('dateOfBirth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
];

// Profile update by Admin/HR
const updateEmployeeAdminValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid employee ID parameter'),
  body('role')
    .optional()
    .isIn(['employee', 'hr', 'admin'])
    .withMessage('Invalid role'),
  body('employmentStatus')
    .optional()
    .isIn(['active', 'inactive', 'on_leave', 'terminated'])
    .withMessage('Invalid employment status'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number'),
];

// Attendance validation
const checkInValidation = [
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Remarks cannot exceed 200 characters'),
];

const checkOutValidation = [
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Remarks cannot exceed 200 characters'),
];

const updateAttendanceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attendance ID'),
  body('status')
    .optional()
    .isIn(['present', 'absent', 'half-day', 'leave'])
    .withMessage('Invalid status'),
  body('totalWorkingHours')
    .optional()
    .isNumeric()
    .withMessage('Total working hours must be numeric'),
];

// Leave validation
const applyLeaveValidation = [
  body('leaveType')
    .notEmpty()
    .withMessage('Leave type is required')
    .isIn(['paid', 'sick', 'unpaid'])
    .withMessage('Leave type must be paid, sick, or unpaid'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      const start = new Date(req.body.startDate);
      const end = new Date(endDate);
      if (end < start) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters'),
];

const leaveStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid leave ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  body('adminComment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin comment cannot exceed 500 characters'),
];

// Payroll validation
const updateSalaryStructureValidation = [
  param('employeeId')
    .notEmpty()
    .withMessage('Employee ID parameter is required'),
  body('basicSalary')
    .optional()
    .isNumeric()
    .withMessage('Basic salary must be numeric'),
  body('allowances')
    .optional()
    .isObject()
    .withMessage('Allowances must be an object'),
  body('deductions')
    .optional()
    .isObject()
    .withMessage('Deductions must be an object'),
];

const generatePayrollValidation = [
  body('payPeriod')
    .notEmpty()
    .withMessage('Pay period is required')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Pay period must be in YYYY-MM format (e.g., 2026-08)'),
  body('employeeId')
    .optional()
    .trim(),
];

module.exports = {
  registerValidation,
  loginValidation,
  emailValidation,
  resetPasswordValidation,
  updateProfileMeValidation,
  updateEmployeeAdminValidation,
  checkInValidation,
  checkOutValidation,
  updateAttendanceValidation,
  applyLeaveValidation,
  leaveStatusValidation,
  updateSalaryStructureValidation,
  generatePayrollValidation,
};
