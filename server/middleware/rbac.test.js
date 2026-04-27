'use strict';

const { requireRole } = require('./rbac');

/**
 * Helper: creates a minimal mock Express req/res/next triple.
 */
function makeContext({ user } = {}) {
  const req = { user };
  const res = {
    _status: null,
    _body: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
  };
  const next = jest.fn();
  return { req, res, next };
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

describe('requireRole middleware', () => {
  describe('when req.user is missing', () => {
    test('returns 403 with FORBIDDEN / "Access denied"', () => {
      const { req, res, next } = makeContext({ user: undefined });
      requireRole('admin')(req, res, next);

      expect(res._status).toBe(403);
      expect(res._body).toEqual({
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when req.user exists but role is missing', () => {
    test('returns 403 with FORBIDDEN / "Access denied" when role is undefined', () => {
      const { req, res, next } = makeContext({ user: { sub: '123', email: 'a@b.com' } });
      requireRole('admin')(req, res, next);

      expect(res._status).toBe(403);
      expect(res._body).toEqual({
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 with FORBIDDEN / "Access denied" when role is null', () => {
      const { req, res, next } = makeContext({ user: { sub: '123', role: null } });
      requireRole('admin')(req, res, next);

      expect(res._status).toBe(403);
      expect(res._body).toEqual({
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when req.user.role is not in the allowed list', () => {
    test('returns 403 with FORBIDDEN / "Insufficient permissions"', () => {
      const { req, res, next } = makeContext({ user: { role: 'user' } });
      requireRole('admin')(req, res, next);

      expect(res._status).toBe(403);
      expect(res._body).toEqual({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when role is a non-empty string not in the list', () => {
      const { req, res, next } = makeContext({ user: { role: 'moderator' } });
      requireRole('admin', 'superadmin')(req, res, next);

      expect(res._status).toBe(403);
      expect(res._body).toEqual({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when req.user.role is in the allowed list', () => {
    test('calls next() for a single matching role', () => {
      const { req, res, next } = makeContext({ user: { role: 'admin' } });
      requireRole('admin')(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res._status).toBeNull();
    });

    test('calls next() when role matches one of multiple allowed roles', () => {
      const { req, res, next } = makeContext({ user: { role: 'user' } });
      requireRole('admin', 'user')(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res._status).toBeNull();
    });

    test('calls next() for each allowed role independently', () => {
      for (const role of ['admin', 'superadmin', 'editor']) {
        const { req, res, next } = makeContext({ user: { role } });
        requireRole('admin', 'superadmin', 'editor')(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('factory behavior', () => {
    test('returns a function (middleware)', () => {
      expect(typeof requireRole('admin')).toBe('function');
    });

    test('each call to requireRole returns a new independent middleware', () => {
      const mw1 = requireRole('admin');
      const mw2 = requireRole('user');
      expect(mw1).not.toBe(mw2);
    });
  });
});

// ---------------------------------------------------------------------------
// Property-based tests (fast-check)
// Feature: admin-dashboard, Property 7: RBAC blocks non-admin access
// Feature: admin-dashboard, Property 8: Tampered or missing role claim is rejected
// ---------------------------------------------------------------------------

const fc = require('fast-check');

describe('requireRole — property-based tests', () => {
  /**
   * Validates: Requirements 4.1, 4.2
   * Property 7: RBAC blocks non-admin access
   *
   * For any request carrying a JWT with role: "user" to an admin-only
   * endpoint, requireRole('admin') SHALL return HTTP 403.
   */
  test('P7 — any "user"-role request to admin-only middleware is blocked', () => {
    // Feature: admin-dashboard, Property 7: RBAC blocks non-admin access
    fc.assert(
      fc.property(
        fc.record({
          sub: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
        }),
        ({ sub, email }) => {
          const { req, res, next } = makeContext({ user: { sub, email, role: 'user' } });
          requireRole('admin')(req, res, next);

          return (
            res._status === 403 &&
            res._body.error.code === 'FORBIDDEN' &&
            !next.mock.calls.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 4.4
   * Property 8: Tampered or missing role claim is rejected
   *
   * For any JWT where the role claim has been removed or set to a value
   * that is not in the allowed list, requireRole SHALL return HTTP 403.
   */
  test('P8 — any non-admin role (including tampered/missing) is rejected by admin-only middleware', () => {
    // Feature: admin-dashboard, Property 8: Tampered or missing role claim is rejected
    const nonAdminRole = fc.oneof(
      fc.constant(undefined),
      fc.constant(null),
      fc.constant(''),
      fc.constant('user'),
      // arbitrary strings that are not 'admin'
      fc.string().filter((s) => s !== 'admin'),
    );

    fc.assert(
      fc.property(nonAdminRole, (role) => {
        const user = role === undefined ? { sub: 'x' } : { sub: 'x', role };
        const { req, res, next } = makeContext({ user });
        requireRole('admin')(req, res, next);

        return res._status === 403 && !next.mock.calls.length;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 4.1, 4.2
   * Corollary: any role that IS in the allowed list always passes.
   */
  test('any role that is explicitly allowed always calls next()', () => {
    const roles = ['admin', 'superadmin', 'editor', 'viewer'];

    fc.assert(
      fc.property(
        fc.constantFrom(...roles),
        fc.subarray(roles, { minLength: 1 }),
        (role, allowedSubset) => {
          // Ensure the chosen role is in the allowed subset for this run
          const allowed = allowedSubset.includes(role)
            ? allowedSubset
            : [...allowedSubset, role];

          const { req, res, next } = makeContext({ user: { role } });
          requireRole(...allowed)(req, res, next);

          return next.mock.calls.length === 1 && res._status === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});
