# Requirements Document

## Introduction

A Business Management Admin Dashboard built with React (frontend), Node.js + Express (backend), and MongoDB (database). The system provides secure admin authentication via JWT, an analytics dashboard with Chart.js visualizations, full user management (create, read, update, delete), and role-based access control distinguishing admin and standard user roles. The UI is fully responsive across desktop and mobile viewports.

## Glossary

- **System**: The Business Management Admin Dashboard application as a whole.
- **Auth_Service**: The backend service responsible for authenticating users and issuing JWT tokens.
- **Token**: A JSON Web Token (JWT) issued upon successful login, used to authorize subsequent requests.
- **Admin**: A user with the "admin" role who has full access to all dashboard features.
- **User**: A registered account in the system, which may hold the role of "admin" or "user".
- **User_Manager**: The backend service responsible for creating, reading, updating, and deleting user records.
- **Analytics_Service**: The backend service that aggregates and returns statistical data for the dashboard.
- **Dashboard**: The main frontend view displaying analytics charts and summary statistics.
- **RBAC**: Role-Based Access Control — the mechanism that restricts feature access based on a user's assigned role.
- **Access_Guard**: The frontend and backend component that enforces RBAC rules on routes and API endpoints.
- **Chart**: A visual representation of analytics data rendered using Chart.js.
- **Responsive_UI**: The frontend layout that adapts to screen widths from 320px (mobile) to 1920px (desktop).

---

## Requirements

### Requirement 1: Admin Authentication

**User Story:** As an admin, I want to log in with my credentials and receive a JWT token, so that I can securely access the dashboard.

#### Acceptance Criteria

1. WHEN a user submits a valid email and password, THE Auth_Service SHALL return a signed JWT token with a 24-hour expiry.
2. WHEN a user submits an invalid email or incorrect password, THE Auth_Service SHALL return an HTTP 401 response with a descriptive error message.
3. WHEN a request is made to a protected API endpoint without a valid Token, THE Auth_Service SHALL return an HTTP 401 response and deny access.
4. WHEN a Token has expired, THE Auth_Service SHALL return an HTTP 401 response indicating token expiry.
5. THE Auth_Service SHALL store passwords as bcrypt hashes with a minimum cost factor of 10; plaintext passwords SHALL NOT be persisted.
6. WHEN a user logs out, THE System SHALL invalidate the Token on the client side and redirect the user to the login page.

---

### Requirement 2: Analytics Dashboard

**User Story:** As an admin, I want to view charts and summary statistics on the dashboard, so that I can monitor business metrics at a glance.

#### Acceptance Criteria

1. WHEN an authenticated Admin navigates to the Dashboard, THE Analytics_Service SHALL return aggregated statistics including total user count, active user count, and new registrations within the last 30 days.
2. WHEN the Dashboard loads, THE Dashboard SHALL render at least one line or bar Chart displaying user registration trends over the last 12 months using Chart.js.
3. WHEN the Dashboard loads, THE Dashboard SHALL render a pie or doughnut Chart showing the distribution of users by role.
4. WHEN the Analytics_Service returns data, THE Dashboard SHALL display the data within 2 seconds of the page load completing.
5. IF the Analytics_Service returns an error, THEN THE Dashboard SHALL display a descriptive error message and a retry option without crashing.
6. WHEN an Admin refreshes the Dashboard, THE Analytics_Service SHALL return up-to-date data reflecting the current state of the database.

---

### Requirement 3: User Management

**User Story:** As an admin, I want to add, edit, and delete users, so that I can manage the accounts registered in the system.

#### Acceptance Criteria

1. WHEN an Admin submits a valid new user form with a unique email, name, and role, THE User_Manager SHALL create a new User record and return an HTTP 201 response.
2. WHEN an Admin submits a new user form with an email that already exists, THE User_Manager SHALL return an HTTP 409 response with a descriptive error message and SHALL NOT create a duplicate record.
3. WHEN an Admin submits an edit form for an existing User with valid updated fields, THE User_Manager SHALL update the User record and return an HTTP 200 response.
4. WHEN an Admin requests deletion of a User, THE User_Manager SHALL remove the User record from the database and return an HTTP 200 response.
5. WHEN an Admin requests deletion of their own account, THE User_Manager SHALL return an HTTP 403 response and SHALL NOT delete the record.
6. THE User_Manager SHALL return a paginated list of Users, with a default page size of 20 records, when the user list endpoint is requested.
7. WHEN an Admin submits a user form with a missing required field (name, email, or role), THE System SHALL display a descriptive inline validation error and SHALL NOT submit the request to the User_Manager.

---

### Requirement 4: Role-Based Access Control

**User Story:** As a system owner, I want role-based access control enforced on both the frontend and backend, so that non-admin users cannot access or modify admin-only resources.

#### Acceptance Criteria

1. THE Access_Guard SHALL restrict all user management API endpoints (create, update, delete) to requests carrying a Token with the "admin" role.
2. WHEN a request with a "user" role Token attempts to access an admin-only endpoint, THE Access_Guard SHALL return an HTTP 403 response with a descriptive error message.
3. WHEN a non-admin User is authenticated and navigates to an admin-only frontend route, THE Access_Guard SHALL redirect the User to a "403 Forbidden" page.
4. THE Access_Guard SHALL validate the role claim from the Token on every protected API request; a missing or tampered role claim SHALL result in an HTTP 403 response.
5. WHERE a new role is assigned to a User, THE System SHALL enforce the updated permissions on the next authenticated request without requiring a server restart.

---

### Requirement 5: Responsive UI

**User Story:** As an admin, I want the dashboard to be usable on any device, so that I can manage the business from desktop, tablet, or mobile.

#### Acceptance Criteria

1. THE Responsive_UI SHALL render all pages without horizontal scrolling at viewport widths of 320px, 768px, and 1280px.
2. WHEN the viewport width is below 768px, THE Responsive_UI SHALL collapse the navigation menu into a hamburger menu icon.
3. WHEN the hamburger menu icon is tapped, THE Responsive_UI SHALL expand the navigation menu as an overlay or drawer.
4. THE Responsive_UI SHALL scale Chart elements so that all labels and data points remain legible at viewport widths of 320px and above.
5. THE Responsive_UI SHALL meet WCAG 2.1 Level AA color contrast requirements for all text and interactive elements.
