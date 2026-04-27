'use strict';

const User = require('../models/User');

// ---------------------------------------------------------------------------
// getSummary
// ---------------------------------------------------------------------------

/**
 * Returns aggregate user statistics.
 * @returns {Promise<{ totalUsers: number, activeUsers: number, newLast30Days: number }>}
 */
async function getSummary() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeUsers, newLast30Days] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  return { totalUsers, activeUsers, newLast30Days };
}

// ---------------------------------------------------------------------------
// getRegistrationTrend
// ---------------------------------------------------------------------------

/**
 * Returns monthly registration counts for the last 12 months (including the
 * current month), sorted ascending. Months with zero registrations are filled in.
 * @returns {Promise<Array<{ month: string, count: number }>>}
 */
async function getRegistrationTrend() {
  // Build the list of the last 12 months (YYYY-MM strings), oldest first
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }

  // Aggregate: group by year+month of createdAt
  const results = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' },
              },
            },
          ],
        },
        count: 1,
      },
    },
  ]);

  // Build a lookup map from aggregation results
  const countByMonth = {};
  for (const entry of results) {
    countByMonth[entry.month] = entry.count;
  }

  // Return exactly the 12 months, filling gaps with 0
  return months.map((month) => ({
    month,
    count: countByMonth[month] || 0,
  }));
}

// ---------------------------------------------------------------------------
// getRoleDistribution
// ---------------------------------------------------------------------------

/**
 * Returns user counts grouped by role.
 * @returns {Promise<Array<{ role: string, count: number }>>}
 */
async function getRoleDistribution() {
  const results = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        role: '$_id',
        count: 1,
      },
    },
  ]);

  return results;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  getSummary,
  getRegistrationTrend,
  getRoleDistribution,
};
