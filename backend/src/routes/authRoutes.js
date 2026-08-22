const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  registerValidation,
  loginValidation,
  emailValidation,
  resetPasswordValidation,
} = require('../utils/validators');

const router = express.Router();

// Rate limiter for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 20, // 20 requests per 15 minutes in dev/prod
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, emailValidation, validate, resendVerification);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', authLimiter, emailValidation, validate, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidation, validate, resetPassword);

module.exports = router;
