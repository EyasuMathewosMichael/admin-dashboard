# Design Document: Admin Dashboard

## Overview

The Admin Dashboard is a full-stack web application that provides secure administrative control over a business's user base and exposes analytics visualizations. It is composed of a React single-page application (SPA) served statically, a Node.js + Express REST API, and a MongoDB database.

The system enforces authentication via JSON Web Tokens (JWT) and role-based access control (RBAC) at both the API layer and the frontend routing layer. Analytics data is aggregated server-side and rendered client-side using Chart.js. The UI is fully responsive from 320 px mobile viewports up to 1920 px desktop viewports.

### Key Design Goals

- **Security first**: passwords hashed with bcrypt (cost ≥ 10), JWT validation on every protected request, RBAC enforced on both client and server.
- **Separation of concerns**: authentication, user management, and analytics are distinct backend modules with their own routes and service layers.
- **Resilience**: the frontend degrades gracefully when the API is unavailable; errors are surfaced to the user with retry affordances.
- **Testability**: pure business-logic functions (validation, token parsing, data aggregation) are isolated so they can be unit- and property-tested without I/O.

---

## Architecture

```mermaid
graph TD
    subgraph Browser
        A[React SPA]
        A --> B[React Router]
        B --> C[Access Guard\n(frontend)]
        A --> D[Axios HTTP Client]
    end

    subgraph Express API
        E[Auth Router\n/api/auth]
        F[Users Router\n/api/users]
        G[Analytics Router\n/api/analytics]
        H[JWT Middleware]
        I[RBAC Middleware]
    end

    subgraph Services
        J[Auth Service]
        K[User Service]
        L[Analytics Service]
    end

    subgraph Data
        M[(MongoDB)]
    end

    D -->|HTTP/JSON| E
    D -->|HTTP/JSON| F
    D -->|HTTP/JSON| G

    E --> H --> J
    F --> H --> I --> K
    G --> H --> I --> L

    J --> M
    K --> M
    L --> M
```

### Request Lifecycle

1. The React SPA sends an HTTP request with an `Authorization: Bearer <token>` header.
2. The JWT middleware validates the token signature and expiry; returns 401 on failure.
3. The RBAC middleware checks the `role` claim against the required role for the route; returns 403 on mismatch.
4. The route handler delegates to the appropriate service, which interacts with MongoDB via Mongoose.
5. The service returns a result; the route handler serializes it as JSON and sends the response.

---

## Components and Interfaces

### Backend

#### JWT Middleware (`middleware/auth.js`)

```
verifyToken(req, res, next) → void
  - Reads Authorization header
  - Verifies signature with JWT_SECRET
  - Attaches decoded payload to req.user
  - Returns 401 if missing, invalid, or expired
```

#### RBAC Middleware (`middleware/rbac.js`)

```
requireRole(...roles)(req, res, next) → void
  - Reads req.user.role
  - Passes if role is in the allowed list
  - Returns 403 otherwise
```

#### Auth Router (`routes/auth.js`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Validate credentials, return signed JWT |
| POST | `/api/auth/logout` | No-op on server (client discards token) |

#### Users Router (`routes/users.js`) — admin only

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | Paginated user list |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

#### Analytics Router (`routes/analytics.js`) — admin only

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics/summary` | Aggregated stats (totals, active, new-30d) |
| GET | `/api/analytics/registrations` | Monthly registration counts (last 12 months) |
| GET | `/api/analytics/roles` | User count grouped by role |

### Frontend

#### Route Structure

```
/login                  → LoginPage (public)
/dashboard              → DashboardPage (admin)
/users                  → UserListPage (admin)
/users/new              → UserFormPage (admin)
/users/:id/edit         → UserFormPage (admin)
/403                    → ForbiddenPage (public)
```

#### Access Guard (`components/AccessGuard.jsx`)

Wraps protected routes. Reads the decoded JWT from `AuthContext`. Redirects to `/login` if unauthenticated, to `/403` if the user's role is insufficient.

#### AuthContext (`context/AuthContext.jsx`)

Stores the JWT string and decoded payload in React context + `localStorage`. Exposes `login(token)`, `logout()`, and `user` (decoded payload).

#### Key Page Components

| Component | Responsibility |
|-----------|---------------|
| `LoginPage` | Email/password form, calls `/api/auth/login`, stores token |
| `DashboardPage` | Fetches analytics summary + chart data, renders Chart.js charts |
| `UserListPage` | Paginated table of users, delete action, link to edit |
| `UserFormPage` | Create/edit form with inline validation |
| `ForbiddenPage` | 403 error display |

#### Chart Components (`components/charts/`)

| Component | Chart Type | Data Source |
|-----------|-----------|-------------|
| `RegistrationTrendChart` | Line / Bar | `/api/analytics/registrations` |
| `RoleDistributionChart` | Pie / Doughnut | `/api/analytics/roles` |

---

## Data Models

### User (MongoDB / Mongoose)

```js
{
  _id:          ObjectId,          // auto-generated
  name:         String,            // required
  email:        String,            // required, unique, lowercase
  passwordHash: String,            // bcrypt hash, never returned in API responses
  role:         String,            // enum: ['admin', 'user'], required
  isActive:     Boolean,           // default: true
  createdAt:    Date,              // auto (timestamps: true)
  updatedAt:    Date               // auto (timestamps: true)
}
```

Indexes: `{ email: 1 }` (unique), `{ role: 1 }`, `{ createdAt: -1 }`.

### JWT Payload

```js
{
  sub:   String,   // user._id (as string)
  email: String,
  role:  String,   // 'admin' | 'user'
  iat:   Number,   // issued-at (Unix seconds)
  exp:   Number    // expiry = iat + 86400 (24 h)
}
```

### API Response Envelopes

**Success (list)**
```json
{
  "data": [...],
  "pagination": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 }
}
```

**Success (single)**
```json
{ "data": { ... } }
```

**Error**
```json
{ "error": { "code": "UNAUTHORIZED", "message": "Token has expired" } }
```

### Analytics Aggregation Shapes

**Summary**
```json
{ "totalUsers": 500, "activeUsers": 420, "newLast30Days": 35 }
```

**Registrations (last 12 months)**
```json
[{ "month": "2024-06", "count": 42 }, ...]
```

**Role distribution**
```json
[{ "role": "admin", "count": 5 }, { "role": "user", "count": 495 }]
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid credentials always yield a verifiable token

*For any* valid user record (with a known plaintext password), calling the login service with the correct email and password SHALL return a JWT that, when decoded and verified with the application secret, contains the correct `sub`, `email`, and `role` claims and has an expiry exactly 24 hours after issuance.

**Validates: Requirements 1.1**

---

### Property 2: Invalid credentials never yield a token

*For any* combination of email and password where either the email does not exist in the database or the password does not match the stored hash, the login service SHALL NOT return a JWT and SHALL return an HTTP 401 response.

**Validates: Requirements 1.2**

---

### Property 3: Password storage never contains plaintext

*For any* user created through the system, the value stored in the `passwordHash` field SHALL NOT equal the original plaintext password, and SHALL be verifiable by `bcrypt.compare`.

**Validates: Requirements 1.5**

---

### Property 4: Duplicate email rejection

*For any* existing user email in the database, attempting to create a new user with that same email SHALL return an HTTP 409 response and the total number of user records in the database SHALL remain unchanged.

**Validates: Requirements 3.2**

---

### Property 5: Self-deletion prevention

*For any* authenticated admin user, requesting deletion of their own user ID SHALL return an HTTP 403 response and the admin's record SHALL still exist in the database afterward.

**Validates: Requirements 3.5**

---

### Property 6: Pagination invariant

*For any* page number `p` and page size `s` requested against the user list endpoint, the number of records returned SHALL be at most `s`, and the `total` field in the pagination envelope SHALL equal the actual count of all user documents in the database.

**Validates: Requirements 3.6**

---

### Property 7: RBAC blocks non-admin access

*For any* request carrying a JWT with `role: "user"` to any admin-only endpoint (create, update, or delete user), the Access Guard SHALL return an HTTP 403 response and the database state SHALL remain unchanged.

**Validates: Requirements 4.1, 4.2**

---

### Property 8: Tampered or missing role claim is rejected

*For any* JWT where the `role` claim has been removed or altered after signing, the Access Guard SHALL return an HTTP 403 response on every protected request.

**Validates: Requirements 4.4**

---

## Error Handling

### Backend

| Scenario | HTTP Status | Error Code | Notes |
|----------|------------|------------|-------|
| Missing / invalid JWT | 401 | `UNAUTHORIZED` | JWT middleware |
| Expired JWT | 401 | `TOKEN_EXPIRED` | JWT middleware |
| Insufficient role | 403 | `FORBIDDEN` | RBAC middleware |
| Duplicate email | 409 | `CONFLICT` | User service |
| Self-deletion attempt | 403 | `FORBIDDEN` | User service |
| Validation failure | 422 | `VALIDATION_ERROR` | Route handler |
| Resource not found | 404 | `NOT_FOUND` | Route handler |
| Unexpected server error | 500 | `INTERNAL_ERROR` | Global error handler |

A global Express error handler catches unhandled errors, logs them server-side, and returns a sanitized 500 response (no stack traces in production).

### Frontend

- **API errors**: Axios interceptors catch 401 responses globally and trigger `logout()` + redirect to `/login`. Other errors are surfaced via a toast notification system.
- **Analytics load failure**: `DashboardPage` renders an inline error banner with a "Retry" button; the chart area shows a skeleton placeholder until data resolves.
- **Form validation**: Client-side validation runs on submit (and optionally on blur). Errors are displayed inline beneath each field. The form is not submitted to the API if any required field is missing or malformed.
- **Network timeout**: Axios is configured with a 10-second timeout; a user-facing message is shown if the request times out.

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

Focus on isolated, pure logic:

- **Auth service**: `hashPassword` / `verifyPassword` round-trip, `generateToken` / `verifyToken` round-trip, token expiry calculation.
- **RBAC middleware**: correct pass/block behavior for each role combination.
- **User service**: duplicate-email detection, self-deletion guard, pagination offset/limit calculation.
- **Frontend validation**: required-field checks, email format validation, whitespace-only rejection.
- **AccessGuard component**: renders children for authorized roles, redirects for unauthorized roles.

### Property-Based Tests (fast-check)

The project uses [fast-check](https://github.com/dubzzz/fast-check) for property-based testing. Each property test runs a minimum of **100 iterations**.

Each test is tagged with a comment in the format:
`// Feature: admin-dashboard, Property <N>: <property_text>`

Properties to implement:

| Property | Test Target | Generator |
|----------|------------|-----------|
| P1: Valid credentials yield verifiable token | `authService.login` | Arbitrary user records + matching passwords |
| P2: Invalid credentials never yield a token | `authService.login` | Arbitrary email/password pairs not matching DB |
| P3: Password storage never contains plaintext | `authService.createUser` | Arbitrary plaintext password strings |
| P4: Duplicate email rejection | `userService.createUser` | Arbitrary user + same email second attempt |
| P5: Self-deletion prevention | `userService.deleteUser` | Arbitrary admin user deleting own ID |
| P6: Pagination invariant | `userService.listUsers` | Arbitrary page/pageSize combinations |
| P7: RBAC blocks non-admin access | RBAC middleware | Arbitrary JWTs with `role: "user"` |
| P8: Tampered role claim rejected | JWT middleware | Arbitrary JWTs with modified role claim |

### Integration Tests (Supertest + MongoDB Memory Server)

End-to-end API route tests using an in-memory MongoDB instance:

- Full login → protected-route flow.
- User CRUD lifecycle (create → read → update → delete).
- Analytics endpoints return correctly shaped data.
- RBAC enforcement across all protected routes.

### Frontend Component Tests (React Testing Library)

- `LoginPage`: form submission, error display, redirect on success.
- `DashboardPage`: renders charts when data loads, shows error banner on API failure, retry triggers re-fetch.
- `UserListPage`: renders paginated table, delete confirmation, navigation to edit.
- `UserFormPage`: inline validation errors, successful submit closes form.
- `AccessGuard`: redirects unauthenticated users to `/login`, redirects `user`-role to `/403`.

### Responsive / Accessibility

- Manual testing at 320 px, 768 px, and 1280 px viewports.
- Automated WCAG 2.1 AA contrast checks using `jest-axe` on all page components.
- Hamburger menu open/close behavior tested in React Testing Library with viewport mocking.
