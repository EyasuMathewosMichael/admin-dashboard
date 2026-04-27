# Admin Dashboard - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v24.14.1 or higher
- npm 10.x or higher
- MongoDB Atlas account (already configured)

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Start Development Servers

**Option 1: Run both servers together**
```bash
npm run dev
```

**Option 2: Run servers separately**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🔐 Login Credentials

```
Email: admin@example.com
Password: admin123
```

---

## 📋 Available Commands

### Root Level
```bash
npm run dev              # Start both servers (requires concurrently)
npm run start:server     # Start backend only
npm run start:client     # Start frontend only
npm run test             # Run all tests
npm run test:server      # Run backend tests only
npm run test:client      # Run frontend tests only
npm run install:all      # Install dependencies for both
```

### Backend (server/)
```bash
npm run dev              # Start with file watching
npm run test             # Run Jest tests
npm run test -- --watch  # Run tests in watch mode
```

### Frontend (client/)
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## 🎯 Features Overview

### Dashboard
- View user statistics (total, active, new)
- See 12-month registration trend
- View user role distribution

### User Management
- List all users with pagination
- Create new users
- Edit user details
- Delete users (admin-only)

### Authentication
- Secure login with JWT
- Automatic session persistence
- Logout functionality

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Backend Tests Only
```bash
npm run test:server
```

### Expected Output
```
PASS middleware/rbac.test.js
  ✓ 13 tests passed
  ✓ 3 property-based tests passed
```

---

## 🔧 Configuration

### Backend Environment Variables
Located in `server/.env`:
```
PORT=3001
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
```

### Frontend Proxy
Located in `client/vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout

### Users (Admin-only)
- `GET /api/users?page=1&pageSize=20` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics (Admin-only)
- `GET /api/analytics/summary` - User statistics
- `GET /api/analytics/registrations` - Monthly trend
- `GET /api/analytics/roles` - Role distribution

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
Get-Process node | Stop-Process -Force

# Or change port in server/.env
PORT=3002
```

### MongoDB Connection Failed
- Verify MongoDB Atlas credentials in `server/.env`
- Check internet connection
- Ensure IP is whitelisted in MongoDB Atlas

### Frontend Can't Reach Backend
- Verify backend is running on port 3001
- Check Vite proxy configuration in `client/vite.config.js`
- Clear browser cache and reload

### Tests Failing
```bash
# Clear node_modules and reinstall
rm -r server/node_modules
npm install --prefix server
npm run test:server
```

---

## 📁 Project Structure

```
admin-dashboard/
├── client/              # React frontend
├── server/              # Express backend
├── .kiro/               # Kiro specs and documentation
├── package.json         # Root package.json
└── README.md            # Project documentation
```

---

## 🎓 Learning Resources

- **Frontend**: React, Vite, React Router, Axios
- **Backend**: Express, MongoDB, JWT, RBAC
- **Testing**: Jest, Supertest, fast-check (PBT)
- **Charts**: Chart.js, React-ChartJS-2

---

## 📝 Notes

- All passwords are hashed with bcryptjs (cost factor 10)
- JWT tokens expire after 24 hours
- Pagination defaults to 20 items per page
- Admin users cannot delete their own accounts
- Duplicate emails are prevented (409 Conflict)

---

## ✅ Verification Checklist

- [ ] Both servers are running
- [ ] Can access http://localhost:3000
- [ ] Can login with admin@example.com / admin123
- [ ] Dashboard displays with charts
- [ ] Can view user list
- [ ] Can create/edit/delete users
- [ ] All tests pass with `npm run test`

---

## 🚀 Next Steps

1. **Explore the Code**: Check out the implementation in `client/src` and `server/`
2. **Run Tests**: Execute `npm run test` to see all tests passing
3. **Try Features**: Login and explore the dashboard
4. **Customize**: Modify colors, add more features, or deploy to production

---

For more details, see `PROJECT_COMPLETION_SUMMARY.md`
