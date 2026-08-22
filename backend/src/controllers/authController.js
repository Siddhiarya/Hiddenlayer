const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');
const { generateJWT, generateRandomToken, hashToken } = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Register a new user (employee or hr)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { employeeId, email, password, role = 'employee', firstName = '', lastName = '' } = req.body;

    // Check if role is allowed
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly.',
      });
    }

    // Check for existing employeeId or email
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId: employeeId.toUpperCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Employee ID';
      return res.status(409).json({
        success: false,
        message: `${field} is already registered.`,
      });
    }

    // Generate verification token
    const verificationToken = generateRandomToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      employeeId: employeeId.toUpperCase(),
      email: email.toLowerCase(),
      password,
      role,
      firstName,
      lastName,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.employeeId);

    // Create registration notification
    await createNotification(
      user._id,
      'Welcome to Dayflow HRMS',
      'Your account has been created. Please verify your email to unlock all features.',
      'registration'
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. A verification email has been sent to your email address.',
      data: {
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        // Provide token in dev if SMTP is not configured
        ...(process.env.NODE_ENV !== 'production' && { devVerificationToken: verificationToken }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address using token
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token.',
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Create verified notification
    await createNotification(
      user._id,
      'Email Verified',
      'Your email has been verified successfully. You can now access your Dayflow portal.',
      'email_verification'
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please proceed to log in.',
      });
    }

    // Generate fresh verification token
    const verificationToken = generateRandomToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, verificationToken, user.employeeId);

    res.status(200).json({
      success: true,
      message: 'Verification email resent successfully.',
      ...(process.env.NODE_ENV !== 'production' && { devVerificationToken: verificationToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log in user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field explicitly included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email is not verified. Please verify your email before logging in.',
        isVerified: false,
      });
    }

    // Check employment status
    if (user.employmentStatus === 'terminated') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.',
      });
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user._id,
      role: user.role,
      employeeId: user.employeeId,
    });

    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userObj,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & invalidate current JWT token
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const token = req.token;

    if (token) {
      const decoded = jwt.decode(token);
      const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RevokedToken.create({
        token,
        userId: req.user._id,
        expiresAt,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful. Token invalidated.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't expose whether user exists for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' && { devResetToken: resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    // Create notification
    await createNotification(
      user._id,
      'Password Reset Successful',
      'Your password was changed successfully. If you did not perform this action, contact support immediately.',
      'password_reset'
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
