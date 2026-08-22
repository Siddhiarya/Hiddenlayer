const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a JSON Web Token with unique JWT ID (jti)
 * @param {Object} payload - { userId, role, employeeId }
 * @param {string} expiresIn - Token expiry time (e.g., '7d', '24h')
 * @returns {string} Signed JWT
 */
const generateJWT = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  const tokenPayload = {
    ...payload,
    jti: crypto.randomBytes(16).toString('hex'), // Unique token identifier
  };
  return jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn,
  });
};

/**
 * Generate a secure random token (e.g. for email verification, password reset)
 * @returns {string} Random 32-byte hex string
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token with SHA-256 for secure database lookup
 * @param {string} token
 * @returns {string} SHA-256 hash
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateJWT,
  generateRandomToken,
  hashToken,
};
