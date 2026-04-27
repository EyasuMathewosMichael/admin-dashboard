'use strict';

const User = require('../models/User');
const { AppError, hashPassword } = require('./authService');

// ---------------------------------------------------------------------------
// Create user
// ---------------------------------------------------------------------------

/**
 * Create a new user with a hashed password.
 * @param {{ name: string, email: string, password: string, role: string }} param0
 * @returns {Promise<object>} created user (without passwordHash)
 */
async function createUser({ name, email, password, role }) {
  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await User.create({ name, email, passwordHash, role });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Email already in use', 409, 'CONFLICT');
    }
    throw err;
  }

  const userObj = user.toObject();
  delete userObj.passwordHash;
  return userObj;
}

// ---------------------------------------------------------------------------
// List users (paginated)
// ---------------------------------------------------------------------------

/**
 * Return a paginated list of all users (no passwordHash).
 * @param {{ page?: number, pageSize?: number }} options
 * @returns {Promise<{ data: object[], pagination: { page: number, pageSize: number, total: number, totalPages: number } }>}
 */
async function listUsers({ page = 1, pageSize = 20 } = {}) {
  const [users, total] = await Promise.all([
    User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: users.map((u) => u.toObject()),
    pagination: { page, pageSize, total, totalPages },
  };
}

// ---------------------------------------------------------------------------
// Get user by ID
// ---------------------------------------------------------------------------

/**
 * Find a single user by ID.
 * @param {string} id
 * @returns {Promise<object>} user (without passwordHash)
 */
async function getUserById(id) {
  const user = await User.findById(id).select('-passwordHash');

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  return user.toObject();
}

// ---------------------------------------------------------------------------
// Update user
// ---------------------------------------------------------------------------

/**
 * Update allowed fields on a user document.
 * @param {string} id
 * @param {{ name?: string, email?: string, role?: string, isActive?: boolean }} updates
 * @returns {Promise<object>} updated user (without passwordHash)
 */
async function updateUser(id, { name, email, role, isActive }) {
  const user = await User.findById(id).select('-passwordHash');

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Apply only the fields that were explicitly provided
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Email already in use', 409, 'CONFLICT');
    }
    throw err;
  }

  return user.toObject();
}

// ---------------------------------------------------------------------------
// Delete user
// ---------------------------------------------------------------------------

/**
 * Delete a user by ID. Prevents an admin from deleting their own account.
 * @param {string|import('mongoose').Types.ObjectId} requesterId
 * @param {string|import('mongoose').Types.ObjectId} targetId
 * @returns {Promise<{ message: string }>}
 */
async function deleteUser(requesterId, targetId) {
  if (requesterId.toString() === targetId.toString()) {
    throw new AppError('Cannot delete your own account', 403, 'FORBIDDEN');
  }

  const user = await User.findById(targetId);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  await user.deleteOne();

  return { message: 'User deleted successfully' };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
