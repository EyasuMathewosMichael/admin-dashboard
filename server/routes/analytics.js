'use strict';

const { Router } = require('express');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const analyticsService = require('../services/analyticsService');

const router = Router();

// All routes in this file require a valid JWT and admin role
router.use(verifyToken, requireRole('admin'));

// ── GET /summary — aggregated user stats ──────────────────────────────────────

router.get('/summary', async (req, res, next) => {
  try {
    const result = await analyticsService.getSummary();
    return res.status(200).json({ data: result });
  } catch (err) {
    return next(err);
  }
});

// ── GET /registrations — monthly registration trend (last 12 months) ──────────

router.get('/registrations', async (req, res, next) => {
  try {
    const result = await analyticsService.getRegistrationTrend();
    return res.status(200).json({ data: result });
  } catch (err) {
    return next(err);
  }
});

// ── GET /roles — user count grouped by role ───────────────────────────────────

router.get('/roles', async (req, res, next) => {
  try {
    const result = await analyticsService.getRoleDistribution();
    return res.status(200).json({ data: result });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
