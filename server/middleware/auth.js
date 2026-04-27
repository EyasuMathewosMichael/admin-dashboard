'use strict';

const { verifyToken: verifyJwt } = require('../services/authService');

/**
 * Express middleware that validates a Bearer JWT from the Authorization header.
 *
 * - Missing or malformed header → 401 UNAUTHORIZED "No token provided"
 * - Expired token (TokenExpiredError) → 401 TOKEN_EXPIRED "Token has expired"
 * - Invalid token (JsonWebTokenError or other) → 401 UNAUTHORIZED "Invalid token"
 * - Valid token → attaches decoded payload to req.user and calls next()
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'No token provided' },
    });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = verifyJwt(token);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      });
    }

    // JsonWebTokenError or any other error
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
    });
  }
}

module.exports = { verifyToken };
