'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ---------------------------------------------------------------------------
// Structured error helper
// ---------------------------------------------------------------------------

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Password utilities
// ---------------------------------------------------------------------------

/**
 * Hash a plaintext password using bcrypt with cost factor 10.
 * @param {string} plaintext
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, 10);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param {string} plaintext
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

// ---------------------------------------------------------------------------
// JWT utilities
// ---------------------------------------------------------------------------

/**
 * Generate a signed JWT for the given user.
 * Payload: { sub, email, role }
 * Expiry: 86400 seconds (24 hours)
 * @param {{ _id: import('mongoose').Types.ObjectId, email: string, role: string }} user
 * @returns {string} signed JWT
 */
function generateToken(user) {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 });
}

/**
 * Verify and decode a JWT.
 * Throws JsonWebTokenError or TokenExpiredError on failure — callers handle
 * the specific error type.
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Authenticate a user by email and password.
 * Returns { token, user } on success.
 * Throws an AppError with statusCode 401 and code 'UNAUTHORIZED' on failure.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
async function login(email, password) {
  // passwordHash is select:false — explicitly include it for this query
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const token = generateToken(user);

  // Return a plain user object without the passwordHash
  const userObj = user.toObject();
  delete userObj.passwordHash;

  return { token, user: userObj };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  AppError,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  login,
};
