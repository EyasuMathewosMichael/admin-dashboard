'use strict';

const { Router } = require('express');
const { login, AppError } = require('../services/authService');

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};

  // Validate required fields
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'email and password are required',
      },
    });
  }

  try {
    const { token, user } = await login(email, password);
    return res.status(200).json({ data: { token, user } });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 401) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: err.message,
        },
      });
    }
    return next(err);
  }
});

// POST /api/auth/logout
// No-op on server side — client discards the token
router.post('/logout', (_req, res) => {
  return res.status(200).json({ data: { message: 'Logged out successfully' } });
});

module.exports = router;
