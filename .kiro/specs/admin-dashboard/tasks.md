# Implementation Plan: Admin Dashboard

## Overview

Implement the full-stack Admin Dashboard incrementally, starting with the backend foundation (data models, auth, middleware), then user management and analytics services, followed by the React frontend (auth flow, dashboard, user management), and finishing with responsive layout and accessibility. Each phase wires into the previous one so there is no orphaned code.

## Tasks

- [x] 1. Project scaffolding and shared configuration
  - Initialize the Express app entry point (`server.js`) with middleware (JSON body parser, CORS, global error handler)
  - Create the Mongoose connection module (`db/connection.js`)
  - Define environment variable schema (`.env.example`): `PORT`, `MONGO_URI`, `JWT_SECRET`
  - Set up Jest configuration for the backend (`jest.config.js`) with coverage thresholds
  - Set up the React app (Vite or CRA) with folder structure: `src/components`, `src/context`, `src/pages`, `src/hooks`, `src/api`
  - Configure Axios instance (`src/api/axiosClient.js`) with base URL and 10-second timeout
  - _Requirements: 1.1, 1.3, 2.4_

- [x] 2. User data model
  - [x] 2.1 Implement the Mongoose `User` model (`models/User.js`)
    - Fields: `name`, `email` (unique, lowercase), `passwordHash`, `role` (enum: admin/user), `isActive`, timestamps
    - Add indexes: `{ email: 1 }` unique, `{ role: 1 }`, `{ createdAt: -1 }`
    - _Requirements: 1.5, 3.1, 3.2_

  - [ ]* 2.2 Write unit tests for the User model
    - Test required-field validation, email uniqueness constraint, role enum enforcement
    - _Requirements: 3.1, 3.2_

- [x] 3. Auth service and JWT utilities
  - [x] 3.1 Implement `services/authService.js`
    - `hashPassword(plaintext)` → bcrypt hash (cost ≥ 10)
    - `verifyPassword(plaintext, hash)` → boolean
    - `generateToken(user)` → signed JWT (sub, email, role, exp = iat + 86400)
    - `verifyToken(token)` → decoded payload or throws
    - _Requirements: 1.1, 1.5_

  - [ ]* 3.2 Write property test for valid credentials yielding a verifiable token
    - **Property 1: Valid credentials always yield a verifiable token**
    - **Validates: Requirements 1.1**
    - Tag: `// Feature: admin-dashboard, Property 1: Valid credentials always yield a verifiable token`

  - [ ]* 3.3 Write property test for invalid credentials never yielding a token
    - **Property 2: Invalid credentials never yield a token**
    - **Validates: Requirements 1.2**
    - Tag: `// Feature: admin-dashboard, Property 2: Invalid credentials never yield a token`

  - [ ]* 3.4 Write property test for password storage never containing plaintext
    - **Property 3: Password storage never contains plaintext**
    - **Validates: Requirements 1.5**
    - Tag: `// Feature: admin-dashboard, Property 3: Password storage never contains plaintext`

  - [ ]* 3.5 Write unit tests for auth service
    - Test `hashPassword`/`verifyPassword` round-trip, `generateToken`/`verifyToken` round-trip, token expiry calculation
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. JWT and RBAC middleware
  - [x] 4.1 Implement `middleware/auth.js` — `verifyToken(req, res, next)`
    - Read `Authorization: Bearer <token>` header
    - Verify signature with `JWT_SECRET`; attach decoded payload to `req.user`
    - Return 401 `UNAUTHORIZED` if missing or invalid; 401 `TOKEN_EXPIRED` if expired
    - _Requirements: 1.3, 1.4_

  - [x] 4.2 Implement `middleware/rbac.js` — `requireRole(...roles)(req, res, next)`
    - Read `req.user.role`; pass if role is in the allowed list
    - Return 403 `FORBIDDEN` otherwise; also reject missing or tampered role claims
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ]* 4.3 Write property test for RBAC blocking non-admin access
    - **Property 7: RBAC blocks non-admin access**
    - **Validates: Requirements 4.1, 4.2**
    - Tag: `// Feature: admin-dashboard, Property 7: RBAC blocks non-admin access`

  - [ ]* 4.4 Write property test for tampered or missing role claim rejection
    - **Property 8: Tampered or missing role claim is rejected**
    - **Validates: Requirements 4.4**
    - Tag: `// Feature: admin-dashboard, Property 8: Tampered or missing role claim is rejected`

  - [ ]* 4.5 Write unit tests for JWT and RBAC middleware
    - Test pass/block behavior for each role combination; test expired and malformed tokens
    - _Requirements: 1.3, 1.4, 4.1, 4.2, 4.4_

- [x] 5. Auth routes
  - [x] 5.1 Implement `routes/auth.js`
    - `POST /api/auth/login`: validate body, call `authService`, return signed JWT on success, 401 on failure
    - `POST /api/auth/logout`: no-op (client discards token); return 200
    - Wire router into `server.js`
    - _Requirements: 1.1, 1.2, 1.6_

  - [ ]* 5.2 Write integration tests for auth routes (Supertest + MongoDB Memory Server)
    - Test successful login returns JWT, invalid credentials return 401, missing fields return 422
    - _Requirements: 1.1, 1.2_

- [x] 6. Checkpoint — backend auth layer
  - Ensure all auth-related tests pass, ask the user if questions arise.

- [x] 7. User service
  - [x] 7.1 Implement `services/userService.js`
    - `createUser(data)`: hash password, save User, throw 409 on duplicate email
    - `listUsers({ page, pageSize })`: return paginated result with `data` and `pagination` envelope
    - `updateUser(id, data)`: update fields, return updated document
    - `deleteUser(requesterId, targetId)`: throw 403 if `requesterId === targetId`, else delete
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.2 Write property test for duplicate email rejection
    - **Property 4: Duplicate email rejection**
    - **Validates: Requirements 3.2**
    - Tag: `// Feature: admin-dashboard, Property 4: Duplicate email rejection`

  - [ ]* 7.3 Write property test for self-deletion prevention
    - **Property 5: Self-deletion prevention**
    - **Validates: Requirements 3.5**
    - Tag: `// Feature: admin-dashboard, Property 5: Self-deletion prevention`

  - [ ]* 7.4 Write property test for pagination invariant
    - **Property 6: Pagination invariant**
    - **Validates: Requirements 3.6**
    - Tag: `// Feature: admin-dashboard, Property 6: Pagination invariant`

  - [ ]* 7.5 Write unit tests for user service
    - Test duplicate-email detection, self-deletion guard, pagination offset/limit calculation
    - _Requirements: 3.2, 3.5, 3.6_

- [x] 8. Users routes
  - [x] 8.1 Implement `routes/users.js` (admin only)
    - `GET /api/users`: call `userService.listUsers`, return paginated envelope
    - `POST /api/users`: validate body (name, email, role required), call `userService.createUser`, return 201
    - `PUT /api/users/:id`: validate body, call `userService.updateUser`, return 200
    - `DELETE /api/users/:id`: call `userService.deleteUser`, return 200 or 403
    - Apply `verifyToken` + `requireRole('admin')` to all routes
    - Wire router into `server.js`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1_

  - [ ]* 8.2 Write integration tests for users routes (Supertest + MongoDB Memory Server)
    - Test full CRUD lifecycle, duplicate email 409, self-delete 403, pagination, RBAC 403 for user-role tokens
    - _Requirements: 3.1–3.7, 4.1, 4.2_

- [x] 9. Analytics service and routes
  - [x] 9.1 Implement `services/analyticsService.js`
    - `getSummary()`: aggregate total users, active users, new registrations in last 30 days
    - `getRegistrationTrend()`: monthly counts for last 12 months
    - `getRoleDistribution()`: user count grouped by role
    - _Requirements: 2.1, 2.6_

  - [x] 9.2 Implement `routes/analytics.js` (admin only)
    - `GET /api/analytics/summary` → `analyticsService.getSummary()`
    - `GET /api/analytics/registrations` → `analyticsService.getRegistrationTrend()`
    - `GET /api/analytics/roles` → `analyticsService.getRoleDistribution()`
    - Apply `verifyToken` + `requireRole('admin')` to all routes
    - Wire router into `server.js`
    - _Requirements: 2.1, 2.6, 4.1_

  - [ ]* 9.3 Write integration tests for analytics routes (Supertest + MongoDB Memory Server)
    - Test summary shape, registration trend array length (12 months), role distribution grouping, RBAC enforcement
    - _Requirements: 2.1, 2.6, 4.1_

- [x] 10. Checkpoint — full backend API
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 11. Frontend auth context and login page
  - [x] 11.1 Implement `context/AuthContext.jsx`
    - Store JWT string and decoded payload in React context + `localStorage`
    - Expose `login(token)`, `logout()`, and `user` (decoded payload)
    - On app load, rehydrate from `localStorage` and validate token expiry
    - _Requirements: 1.1, 1.6_

  - [x] 11.2 Implement `LoginPage.jsx`
    - Email/password form with inline validation (required fields, email format)
    - On submit, call `POST /api/auth/login`; on success store token via `AuthContext.login()` and redirect to `/dashboard`
    - Display descriptive error message on 401 response
    - _Requirements: 1.1, 1.2, 3.7_

  - [x] 11.3 Configure Axios interceptors in `axiosClient.js`
    - Attach `Authorization: Bearer <token>` header from `AuthContext` on every request
    - On 401 response, call `logout()` and redirect to `/login`
    - Set 10-second timeout; show user-facing message on timeout
    - _Requirements: 1.3, 1.4, 2.5_

  - [ ]* 11.4 Write component tests for LoginPage and AuthContext
    - Test form submission, error display on 401, redirect on success, logout clears storage
    - _Requirements: 1.1, 1.2, 1.6_

- [x] 12. Frontend routing and Access Guard
  - [x] 12.1 Implement `components/AccessGuard.jsx`
    - Wrap protected routes; read decoded JWT from `AuthContext`
    - Redirect to `/login` if unauthenticated; redirect to `/403` if role is insufficient
    - _Requirements: 4.3_

  - [x] 12.2 Configure React Router with all routes
    - Public: `/login`, `/403`
    - Admin-protected (via `AccessGuard`): `/dashboard`, `/users`, `/users/new`, `/users/:id/edit`
    - _Requirements: 4.3_

  - [ ]* 12.3 Write component tests for AccessGuard
    - Test renders children for admin role, redirects to `/login` for unauthenticated, redirects to `/403` for user role
    - _Requirements: 4.3_

- [x] 13. Dashboard page and chart components
  - [x] 13.1 Implement `components/charts/RegistrationTrendChart.jsx`
    - Fetch `/api/analytics/registrations`; render a Chart.js line or bar chart
    - Show skeleton placeholder while loading; show inline error banner with "Retry" button on failure
    - _Requirements: 2.2, 2.4, 2.5_

  - [x] 13.2 Implement `components/charts/RoleDistributionChart.jsx`
    - Fetch `/api/analytics/roles`; render a Chart.js pie or doughnut chart
    - Show skeleton placeholder while loading; show inline error banner with "Retry" button on failure
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 13.3 Implement `DashboardPage.jsx`
    - Fetch `/api/analytics/summary` and display total users, active users, new-last-30-days cards
    - Compose `RegistrationTrendChart` and `RoleDistributionChart`
    - Display data within 2 seconds of page load; show error banner with retry on API failure
    - _Requirements: 2.1, 2.4, 2.5, 2.6_

  - [ ]* 13.4 Write component tests for DashboardPage and chart components
    - Test renders charts when data loads, shows error banner on API failure, retry triggers re-fetch
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 14. User management pages
  - [x] 14.1 Implement `UserListPage.jsx`
    - Fetch `GET /api/users` with pagination controls (page, pageSize = 20)
    - Render paginated table with name, email, role, isActive columns
    - Delete button with confirmation dialog; calls `DELETE /api/users/:id`
    - Link to `/users/:id/edit` and `/users/new`
    - _Requirements: 3.4, 3.5, 3.6_

  - [x] 14.2 Implement `UserFormPage.jsx` (create and edit)
    - Shared form for create (`POST /api/users`) and edit (`PUT /api/users/:id`)
    - Required fields: name, email, role; inline validation errors on submit (and optionally on blur)
    - Do not submit if any required field is missing or malformed
    - Display server-side error messages (409 conflict, etc.)
    - _Requirements: 3.1, 3.2, 3.3, 3.7_

  - [ ]* 14.3 Write component tests for UserListPage and UserFormPage
    - Test paginated table render, delete confirmation, inline validation errors, successful submit
    - _Requirements: 3.1, 3.3, 3.4, 3.6, 3.7_

- [x] 15. Checkpoint — full frontend feature parity
  - Ensure all frontend tests pass, ask the user if questions arise.

- [x] 16. Responsive layout and accessibility
  - [x] 16.1 Implement responsive CSS/layout for all pages
    - No horizontal scrolling at 320 px, 768 px, and 1280 px viewports
    - Collapse navigation into a hamburger menu icon below 768 px
    - Hamburger tap expands navigation as overlay or drawer
    - Scale Chart.js elements so labels and data points remain legible at 320 px
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 16.2 Implement `ForbiddenPage.jsx`
    - Display a clear 403 Forbidden message with a link back to `/dashboard`
    - _Requirements: 4.3_

  - [ ]* 16.3 Write accessibility tests using jest-axe
    - Run `jest-axe` on `LoginPage`, `DashboardPage`, `UserListPage`, `UserFormPage`, `ForbiddenPage`
    - Assert no WCAG 2.1 AA violations
    - _Requirements: 5.5_

  - [ ]* 16.4 Write component tests for hamburger menu behavior
    - Test menu collapses below 768 px, expands on tap/click, closes on overlay click
    - _Requirements: 5.2, 5.3_

- [x] 17. Final checkpoint — all tests pass
  - Ensure all unit, property, integration, and component tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Each property test file must include the tag comment: `// Feature: admin-dashboard, Property <N>: <description>`
- Integration tests use Supertest + MongoDB Memory Server (no live database required)
- Checkpoints at tasks 6, 10, 15, and 17 ensure incremental validation before moving to the next phase
