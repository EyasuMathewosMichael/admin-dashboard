'use strict';

/**
 * RBAC (Role-Based Access Control) middleware factory.
 *
 * Returns an Express middleware that checks whether the authenticated user's
 * role is in the allowed list. Must be used AFTER the verifyToken middleware,
 * which is responsible for populating req.user from the JWT payload.
 *
 * Usage:
 *   router.get('/admin-only', verifyToken, requireRole('admin'), handler)
 *   router.get('/multi-role', verifyToken, requireRole('admin', 'moderator'), handler)
 *
 * @param {...string} roles - One or more allowed role strings.
 * @returns {import('express').RequestHandler}
 */
function requireRole(...roles) {
  return function rbacMiddleware(req, res, next) {
    // req.user must be set by verifyToken before this middleware runs
    if (!req.user || req.user.role === undefined || req.user.role === null) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    return next();
  };
}

module.exports = { requireRole };
