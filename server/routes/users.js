'use strict';

const { Router } = require('express');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const userService = require('../services/userService');
const { AppError } = require('../services/authService');

const router = Router();

// All routes in this file require a valid JWT and admin role
router.use(verifyToken, requireRole('admin'));

// ── GET / — list users with pagination ────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const page     = parseInt(req.query.page, 10)     || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const search   = req.query.search   || '';
    const role     = req.query.role     || '';
    const status   = req.query.status   || '';

    const result = await userService.listUsers({ page, pageSize, search, role, status });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

// ── GET /:id — get single user ────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    return res.status(200).json({ data: user });
  } catch (err) {
    return next(err);
  }
});

// ── POST / — create user ──────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    const missing = [];
    if (!name || typeof name !== 'string') missing.push('name');
    if (!email || typeof email !== 'string') missing.push('email');
    if (!password || typeof password !== 'string') missing.push('password');
    if (!role || typeof role !== 'string') missing.push('role');

    if (missing.length > 0) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Missing or invalid required fields: ${missing.join(', ')}`,
        },
      });
    }

    const user = await userService.createUser({ name, email, password, role });

    return res.status(201).json({ data: user });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 409) {
      return res.status(409).json({
        error: { code: err.code, message: err.message },
      });
    }
    return next(err);
  }
});

// ── PUT /:id — update user ────────────────────────────────────────────────────

router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;

    // At least one updatable field must be provided
    if (
      name === undefined &&
      email === undefined &&
      role === undefined &&
      isActive === undefined
    ) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one of name, email, role, or isActive must be provided',
        },
      });
    }

    const user = await userService.updateUser(req.params.id, {
      name,
      email,
      role,
      isActive,
    });

    return res.status(200).json({ data: user });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 404) {
      return res.status(404).json({
        error: { code: err.code, message: err.message },
      });
    }
    if (err instanceof AppError && err.statusCode === 409) {
      return res.status(409).json({
        error: { code: err.code, message: err.message },
      });
    }
    return next(err);
  }
});

// ── DELETE /:id — delete user ─────────────────────────────────────────────────

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.user.sub, req.params.id);

    return res.status(200).json({ data: result });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 403) {
      return res.status(403).json({
        error: { code: err.code, message: err.message },
      });
    }
    if (err instanceof AppError && err.statusCode === 404) {
      return res.status(404).json({
        error: { code: err.code, message: err.message },
      });
    }
    return next(err);
  }
});

module.exports = router;
