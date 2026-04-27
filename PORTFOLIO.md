# Admin Dashboard

A full-stack admin dashboard with JWT authentication, role-based access control, and real-time analytics.

## Overview

This project demonstrates full-stack development with a focus on security, testing, and user experience. Built with React, Node.js, and MongoDB.

**Live Demo:** https://admin-dashboard-liart-two-29.vercel.app  
**GitHub:** https://github.com/EyasuMathewosMichael/admin-dashboard

## Features

**Authentication & Security**
- JWT tokens with 24-hour expiry
- Secure password hashing (bcryptjs, cost ≥ 10)
- Role-based access control (Admin/User)
- Protected routes with automatic redirection
- Self-deletion protection for admins

**User Management**
- CRUD operations with validation
- Pagination (20 items per page)
- Email uniqueness enforcement
- User status management (Active/Inactive)
- Role assignment

**Analytics**
- Real-time statistics (total users, active users, new registrations)
- 12-month registration trends
- Role distribution visualization
- Responsive charts

**User Interface**
- Responsive design (320px, 768px, 1280px)
- WCAG 2.1 AA accessibility compliance
- Consistent navigation across pages
- User-friendly error handling
- Loading states with skeleton placeholders

## Technology Stack

**Backend**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Jest + Supertest for testing

**Frontend**
- React 18 with Vite
- React Router for navigation
- Axios for HTTP requests
- Recharts for charts
- CSS-in-JS styling

## Project Structure

```
admin-dashboard/
├── server/
│   ├── middleware/          # Auth & RBAC
│   ├── models/              # Database schemas
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   ├── db/                  # Database connection
│   └── server.js            # Express app
├── client/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth state
│   │   └── api/             # HTTP client
│   └── vite.config.js
└── README.md
```

## API Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Users**
- `GET /api/users` - List users (paginated)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

**Analytics**
- `GET /api/analytics/summary` - User statistics
- `GET /api/analytics/registrations` - Registration trends
- `GET /api/analytics/roles` - Role distribution

## Testing

16 tests total:
- 13 unit/integration tests
- 3 property-based tests (100+ iterations each)
- 100% coverage for critical paths

Run tests:
```bash
cd server
npm test
```

## Security

- JWT authentication with 24-hour expiry
- Password hashing with bcryptjs (cost ≥ 10)
- RBAC middleware on all protected endpoints
- Input validation on all endpoints
- Self-deletion protection
- Email uniqueness validation
- CORS protection

## Performance

- API response time: <100ms average
- Database indexing on email and role fields
- Pagination for efficient data retrieval
- Connection pooling for database
- Code splitting on frontend

## Accessibility

- WCAG 2.1 AA color contrast compliance
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatible

## Getting Started

**Prerequisites**
- Node.js 18+
- MongoDB Atlas account (free tier)

**Backend Setup**
```bash
cd server
npm install
cp .env.example .env
# Update .env with MongoDB URI and JWT_SECRET
npm run seed    # Seed default admin user
npm start       # Runs on http://localhost:3001
```

**Frontend Setup**
```bash
cd client
npm install
npm run dev      # Runs on http://localhost:3000
```

**Default Credentials**
- Email: admin@example.com
- Password: admin123

## Deployment

See DEPLOYMENT.md for detailed instructions for:
- Vercel (frontend)
- Render (backend)
- MongoDB Atlas (database)
- AWS, DigitalOcean, Heroku (alternatives)

## Documentation

- [README.md](./README.md) - Project overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) - How to customize
- [CASE_STUDY.md](./CASE_STUDY.md) - Design decisions

## Key Metrics

| Metric | Value |
|--------|-------|
| Backend Tests | 13 passing |
| Property-Based Tests | 3 passing |
| API Endpoints | 8 total |
| Frontend Pages | 5 pages |
| Code Coverage | 100% for critical paths |
| WCAG Compliance | 2.1 AA |
| Response Time | <100ms average |
| Mobile Breakpoints | 3 (320px, 768px, 1280px) |

## What This Shows

**Technical Skills**
- Full-stack development (React + Node.js)
- Authentication and security (JWT, bcryptjs)
- Authorization and RBAC
- Database design (MongoDB, Mongoose)
- RESTful API design
- Testing (unit, integration, property-based)
- Responsive design
- Accessibility compliance

**Professional Practices**
- Clean code architecture
- Comprehensive documentation
- Error handling and validation
- Security best practices
- Performance optimization
- Test-driven development

## Future Enhancements

- Email verification for new users
- Password reset functionality
- Two-factor authentication
- Audit logging for admin actions
- Rate limiting for API endpoints
- Token refresh endpoint
