const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');

/**
 * Protect routes - Authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  try {
    // Check if token has been revoked / logged out
    const isRevoked = await RevokedToken.findOne({ token });
    if (isRevoked) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please log in again.',
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Find user in database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (user.employmentStatus === 'terminated') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or terminated.',
      });
    }

    // Attach user and raw token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Authorization denied.',
    });
  }
};

module.exports = {
  authenticate,
};
