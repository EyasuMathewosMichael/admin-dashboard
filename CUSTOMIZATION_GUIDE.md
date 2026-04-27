# Customization Guide

Learn how to customize the Admin Dashboard for your specific needs.

---

## 🎨 Branding & Styling

### Change Colors

All colors are defined as inline styles in component files. To change the color scheme:

#### 1. Update Login Page Colors

File: `client/src/pages/LoginPage.jsx`

```javascript
// Find the styles object and update colors
const styles = {
  button: {
    backgroundColor: '#2563eb',  // Change this to your color
    // ...
  },
  // ...
}
```

**Common colors to change:**
- Primary button: `#2563eb` (blue)
- Error/danger: `#dc2626` (red)
- Success: `#10b981` (green)
- Background: `#f3f4f6` (light gray)

#### 2. Update Dashboard Colors

File: `client/src/pages/DashboardPage.jsx`

```javascript
// Update button colors
style={{
  background: '#2563eb',  // Primary color
  color: '#ffffff',
}}
```

#### 3. Update Chart Colors

File: `client/src/components/charts/RegistrationTrendChart.jsx`

```javascript
borderColor: '#2563eb',  // Line color
backgroundColor: 'rgba(37, 99, 235, 0.1)',  // Fill color
```

File: `client/src/components/charts/RoleDistributionChart.jsx`

```javascript
const ROLE_COLORS = {
  admin: '#2563eb',    // Admin color
  user: '#10b981',     // User color
};
```

### Change Fonts

Update `client/src/index.css`:

```css
body {
  font-family: 'Your Font Name', sans-serif;
}
```

### Change Logo/Favicon

Replace `client/public/favicon.svg` with your logo:

```bash
# Replace the file
cp your-logo.svg client/public/favicon.svg
```

---

## 👥 Add New User Roles

### Step 1: Update User Model

File: `server/models/User.js`

```javascript
const userSchema = new Schema({
  // ... existing fields
  role: {
    type: String,
    enum: ['admin', 'user', 'manager', 'viewer'],  // Add new roles here
    default: 'user',
  },
  // ...
});
```

### Step 2: Update RBAC Middleware

File: `server/middleware/rbac.js`

```javascript
// No changes needed - middleware works with any role
// Just use the new role names in routes
```

### Step 3: Update Routes

File: `server/routes/users.js`

```javascript
// Restrict endpoints to specific roles
router.get('/', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  // Only admin and manager can list users
});
```

### Step 4: Update Frontend

File: `client/src/components/AccessGuard.jsx`

```javascript
// Update role checks
if (user.role === 'admin' || user.role === 'manager') {
  // Show admin features
}
```

### Step 5: Update Analytics

File: `server/services/analyticsService.js`

```javascript
// Add role-specific analytics
async function getRoleDistribution() {
  const results = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);
  return results;
}
```

---

## 📊 Add New Analytics

### Step 1: Create Service Method

File: `server/services/analyticsService.js`

```javascript
async function getActiveUsersByRole() {
  const results = await User.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);
  return results;
}

module.exports = {
  // ... existing exports
  getActiveUsersByRole,
};
```

### Step 2: Create Route

File: `server/routes/analytics.js`

```javascript
router.get('/active-by-role', async (req, res, next) => {
  try {
    const result = await analyticsService.getActiveUsersByRole();
    return res.status(200).json({ data: result });
  } catch (err) {
    return next(err);
  }
});
```

### Step 3: Create Chart Component

File: `client/src/components/charts/ActiveUsersByRoleChart.jsx`

```javascript
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ActiveUsersByRoleChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: ['#2563eb', '#10b981'],
      },
    ],
  };

  return <Doughnut data={chartData} />;
}
```

### Step 4: Add to Dashboard

File: `client/src/pages/DashboardPage.jsx`

```javascript
const [activeByRole, setActiveByRole] = useState(null);

// In fetchData:
const activeByRoleRes = await axiosClient.get('/api/analytics/active-by-role');
setActiveByRole(activeByRoleRes.data.data);

// In JSX:
<section>
  <h2>Active Users by Role</h2>
  <ActiveUsersByRoleChart data={activeByRole} />
</section>
```

---

## 🗄️ Modify Database Schema

### Step 1: Update User Model

File: `server/models/User.js`

```javascript
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  
  // Add new fields
  department: { type: String },
  phone: { type: String },
  avatar: { type: String },
  lastLogin: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### Step 2: Update Validation

File: `server/services/userService.js`

```javascript
async function createUser(email, password, name, role, isActive, department) {
  // Validate new fields
  if (!department) {
    throw new AppError('Department is required', 422);
  }
  
  // Create user with new fields
  const user = new User({
    email,
    password: hashedPassword,
    name,
    role,
    isActive,
    department,
  });
  
  return user.save();
}
```

### Step 3: Update Frontend Forms

File: `client/src/pages/UserFormPage.jsx`

```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  role: 'user',
  isActive: true,
  department: '',  // Add new field
});

// Add input field
<input
  type="text"
  placeholder="Department"
  value={formData.department}
  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
/>
```

### Step 4: Update API Calls

File: `client/src/pages/UserFormPage.jsx`

```javascript
const payload = {
  name: formData.name,
  email: formData.email,
  password: formData.password,
  role: formData.role,
  isActive: formData.isActive,
  department: formData.department,  // Include new field
};
```

---

## 🔐 Add Email Notifications

### Step 1: Install Email Library

```bash
cd server
npm install nodemailer
```

### Step 2: Create Email Service

File: `server/services/emailService.js`

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail(email, name) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Welcome to Admin Dashboard',
    html: `<h1>Welcome ${name}!</h1><p>Your account has been created.</p>`,
  });
}

module.exports = { sendWelcomeEmail };
```

### Step 3: Use in User Service

File: `server/services/userService.js`

```javascript
const { sendWelcomeEmail } = require('./emailService');

async function createUser(email, password, name, role, isActive) {
  // ... create user
  
  // Send welcome email
  await sendWelcomeEmail(email, name);
  
  return user;
}
```

### Step 4: Update Environment Variables

File: `server/.env`

```
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🔔 Add Real-Time Notifications

### Step 1: Install Socket.IO

```bash
cd server
npm install socket.io
```

### Step 2: Setup Socket.IO

File: `server/server.js`

```javascript
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 3: Emit Events

File: `server/routes/users.js`

```javascript
router.post('/', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await userService.createUser(...);
    
    // Emit event to all connected clients
    io.emit('user:created', user);
    
    return res.status(201).json({ data: user });
  } catch (err) {
    return next(err);
  }
});
```

### Step 4: Listen on Frontend

File: `client/src/pages/UserListPage.jsx`

```javascript
import { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

useEffect(() => {
  socket.on('user:created', (user) => {
    console.log('New user created:', user);
    // Refresh user list
    fetchUsers();
  });
  
  return () => socket.disconnect();
}, []);
```

---

## 🧪 Add Custom Tests

### Step 1: Create Test File

File: `server/services/userService.test.js`

```javascript
const { createUser } = require('./userService');

describe('User Service', () => {
  test('should create a user with valid data', async () => {
    const user = await createUser(
      'test@example.com',
      'password123',
      'Test User',
      'user',
      true
    );
    
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });
  
  test('should reject duplicate email', async () => {
    await expect(
      createUser('test@example.com', 'password123', 'Test', 'user', true)
    ).rejects.toThrow('Email already in use');
  });
});
```

### Step 2: Run Tests

```bash
npm run test:server
```

---

## 🚀 Add API Versioning

### Step 1: Create Versioned Routes

File: `server/routes/v1/users.js`

```javascript
// Version 1 routes
```

File: `server/routes/v2/users.js`

```javascript
// Version 2 routes with new features
```

### Step 2: Mount Routes

File: `server/server.js`

```javascript
app.use('/api/v1/users', require('./routes/v1/users'));
app.use('/api/v2/users', require('./routes/v2/users'));
```

---

## 📱 Add Mobile Support

### Step 1: Create React Native Project

```bash
npx create-expo-app admin-dashboard-mobile
cd admin-dashboard-mobile
npm install axios react-navigation
```

### Step 2: Share API Client

```javascript
// shared/api.js
export const API_BASE_URL = 'https://your-api.com';

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}
```

### Step 3: Create Mobile Screens

```javascript
// screens/LoginScreen.js
import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { login } from '../shared/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    const result = await login(email, password);
    // Handle result
  };
  
  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
```

---

## 🎯 Common Customizations

### Change Default Page Size

File: `server/services/userService.js`

```javascript
const DEFAULT_PAGE_SIZE = 50;  // Change from 20
```

### Change Token Expiry

File: `server/services/authService.js`

```javascript
const JWT_EXPIRY = 7 * 24 * 60 * 60;  // 7 days instead of 24 hours
```

### Change Password Requirements

File: `server/services/userService.js`

```javascript
function validatePassword(password) {
  // Add custom validation
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters');
  }
}
```

### Change UI Layout

File: `client/src/pages/DashboardPage.jsx`

```javascript
// Change grid layout
gridTemplateColumns: 'repeat(3, 1fr)',  // 3 columns instead of auto-fit
```

---

## 📞 Support

For customization help:
1. Review the relevant code files
2. Check the API documentation
3. Test changes locally first
4. Deploy to staging before production
5. Monitor for errors after deployment

---

## 🎉 Next Steps

1. Choose your customization
2. Follow the step-by-step guide
3. Test thoroughly
4. Deploy to production
5. Monitor performance

**Happy customizing!** 🚀
