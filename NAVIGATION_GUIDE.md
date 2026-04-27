# Navigation Guide - How to Navigate Between Pages

Complete guide on how to navigate between pages in the Admin Dashboard with all functionality.

---

## 🗺️ Application Routes

### Public Routes (No Authentication Required)
```
/login          → Login Page
/403            → Forbidden Page (Access Denied)
```

### Protected Routes (Admin Only)
```
/dashboard      → Dashboard (Analytics)
/users          → User List
/users/new      → Create New User
/users/:id/edit → Edit User
```

### Fallback Routes
```
/               → Redirects to /dashboard
/*              → Redirects to /dashboard (any unknown route)
```

---

## 🧭 Navigation Flow

### 1. Login Flow
```
/login → Enter credentials → /dashboard (on success)
      → Invalid credentials → Stay on /login (show error)
```

### 2. Dashboard Navigation
```
/dashboard → Click "Users" button → /users
          → Click "Logout" button → /login
```

### 3. User Management Flow
```
/users → Click "Create User" button → /users/new
      → Click "Edit" on user row → /users/:id/edit
      → Click "Delete" on user row → Delete user (stay on /users)
      → Click "Dashboard" → /dashboard
      → Click "Logout" → /login
```

### 4. User Form Flow
```
/users/new → Fill form → Submit → /users (on success)
          → Cancel → /users

/users/:id/edit → Fill form → Submit → /users (on success)
                → Cancel → /users
```

---

## 💻 How to Navigate Programmatically

### Using useNavigate Hook

The `useNavigate` hook from React Router allows you to navigate programmatically.

#### Example 1: Navigate to Dashboard
```javascript
import { useNavigate } from 'react-router-dom';

export default function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

#### Example 2: Navigate with Replace (Don't Add to History)
```javascript
const handleLogin = () => {
  // User won't be able to go back to login page
  navigate('/dashboard', { replace: true });
};
```

#### Example 3: Navigate with State
```javascript
const handleNavigate = () => {
  navigate('/users', { 
    state: { message: 'User created successfully' } 
  });
};
```

#### Example 4: Navigate Back
```javascript
const handleCancel = () => {
  navigate(-1); // Go back one page
};
```

---

## 🔗 How to Navigate with Links

### Using Link Component

The `Link` component creates navigation links without page reload.

#### Example 1: Simple Link
```javascript
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/users">Users</Link>
    </nav>
  );
}
```

#### Example 2: Link with State
```javascript
<Link to="/users" state={{ filter: 'active' }}>
  Active Users
</Link>
```

#### Example 3: Link with Dynamic ID
```javascript
<Link to={`/users/${userId}/edit`}>
  Edit User
</Link>
```

---

## 📍 Current Implementation

### Dashboard Navigation

**File**: `client/src/pages/DashboardPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <button onClick={() => navigate('/users')}>
        Users
      </button>
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
```

### User List Navigation

**File**: `client/src/pages/UserListPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';

export default function UserListPage() {
  const navigate = useNavigate();

  const handleCreateUser = () => {
    navigate('/users/new');
  };

  const handleEditUser = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId) => {
    // Delete logic
    // Stay on same page
  };

  return (
    <div>
      <button onClick={handleCreateUser}>Create User</button>
      <button onClick={() => navigate('/dashboard')}>Dashboard</button>
      <button onClick={() => navigate('/login')}>Logout</button>
    </div>
  );
}
```

### User Form Navigation

**File**: `client/src/pages/UserFormPage.jsx`

```javascript
import { useNavigate, useParams } from 'react-router-dom';

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = async (formData) => {
    try {
      if (id) {
        // Edit user
        await updateUser(id, formData);
      } else {
        // Create user
        await createUser(formData);
      }
      // Navigate back to user list
      navigate('/users');
    } catch (error) {
      // Show error
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Save</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </form>
  );
}
```

---

## 🔐 Protected Routes with AccessGuard

### How AccessGuard Works

**File**: `client/src/components/AccessGuard.jsx`

```javascript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccessGuard({ allowedRoles }) {
  const auth = useAuth();

  // Not authenticated → redirect to login
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but insufficient role → redirect to 403
  if (!allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/403" replace />;
  }

  // Authenticated with correct role → render child routes
  return <Outlet />;
}
```

### Usage in App.jsx

```javascript
<Route element={<AccessGuard allowedRoles={['admin']} />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/users" element={<UserListPage />} />
  <Route path="/users/new" element={<UserFormPage />} />
  <Route path="/users/:id/edit" element={<UserFormPage />} />
</Route>
```

---

## 📱 Complete Navigation Example

### Full Navigation Implementation

```javascript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavigationExample() {
  const navigate = useNavigate();
  const auth = useAuth();

  // Navigate to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Navigate to users list
  const goToUsers = () => {
    navigate('/users');
  };

  // Navigate to create user form
  const goToCreateUser = () => {
    navigate('/users/new');
  };

  // Navigate to edit user form
  const goToEditUser = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  // Navigate to login
  const goToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Navigate to forbidden page
  const goToForbidden = () => {
    navigate('/403');
  };

  // Logout and navigate to login
  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  // Navigate back
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <button onClick={goToDashboard}>Dashboard</button>
      <button onClick={goToUsers}>Users</button>
      <button onClick={goToCreateUser}>Create User</button>
      <button onClick={() => goToEditUser('123')}>Edit User</button>
      <button onClick={goToLogin}>Login</button>
      <button onClick={goToForbidden}>Forbidden</button>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={goBack}>Back</button>
    </div>
  );
}
```

---

## 🎯 Navigation Patterns

### Pattern 1: Form Submission Navigation

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await submitForm(data);
    // Navigate on success
    navigate('/users', { 
      state: { message: 'User created successfully' } 
    });
  } catch (error) {
    // Show error, stay on form
    setError(error.message);
  }
};
```

### Pattern 2: Conditional Navigation

```javascript
const handleAction = () => {
  if (auth.user.role === 'admin') {
    navigate('/users');
  } else {
    navigate('/403');
  }
};
```

### Pattern 3: Navigation with Query Parameters

```javascript
// Navigate with query params
navigate('/users?page=2&sort=name');

// Read query params
import { useSearchParams } from 'react-router-dom';
const [searchParams] = useSearchParams();
const page = searchParams.get('page');
const sort = searchParams.get('sort');
```

### Pattern 4: Navigation with State

```javascript
// Navigate with state
navigate('/users', { 
  state: { 
    message: 'User deleted',
    userId: deletedUserId 
  } 
});

// Read state
import { useLocation } from 'react-router-dom';
const location = useLocation();
const message = location.state?.message;
```

---

## 🔄 Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Application Start                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                    ┌─────────────┐
                    │  /login     │
                    │ LoginPage   │
                    └────┬────────┘
                         │
                    Enter Credentials
                         │
                    ┌────▼────────────────────┐
                    │ Valid Credentials?      │
                    └────┬──────────────┬─────┘
                    Yes  │              │ No
                         │              └──────┐
                         │                     │
                    ┌────▼──────────┐    Show Error
                    │  /dashboard   │    Stay on /login
                    │ DashboardPage │
                    └────┬──────────┘
                         │
            ┌────────────┬┴────────────┐
            │            │            │
       Click Users  Click Logout  View Charts
            │            │            │
            │            │            │
       ┌────▼────┐  ┌────▼────┐      │
       │ /users  │  │ /login  │      │
       │ UserList│  │ LoginPage│     │
       └────┬────┘  └─────────┘      │
            │                        │
    ┌───────┼────────┐               │
    │       │        │               │
Click Create Click Edit Click Delete │
    │       │        │               │
┌───▼──┐ ┌──▼────┐   │               │
│/users│ │/users/│   │               │
│/new  │ │:id/   │   │               │
│      │ │edit   │   │               │
└──────┘ └───────┘   │               │
                     │               │
                     └───────────────┘
```

---

## 🚀 Quick Navigation Reference

### Navigate to Dashboard
```javascript
navigate('/dashboard');
```

### Navigate to Users List
```javascript
navigate('/users');
```

### Navigate to Create User
```javascript
navigate('/users/new');
```

### Navigate to Edit User
```javascript
navigate(`/users/${userId}/edit`);
```

### Navigate to Login
```javascript
navigate('/login', { replace: true });
```

### Navigate to Forbidden
```javascript
navigate('/403');
```

### Navigate Back
```javascript
navigate(-1);
```

### Logout and Navigate
```javascript
auth.logout();
navigate('/login', { replace: true });
```

---

## 📚 React Router Hooks

### useNavigate
Navigate programmatically
```javascript
const navigate = useNavigate();
navigate('/path');
```

### useParams
Get URL parameters
```javascript
const { id } = useParams();
```

### useLocation
Get current location
```javascript
const location = useLocation();
const state = location.state;
```

### useSearchParams
Get query parameters
```javascript
const [searchParams] = useSearchParams();
const page = searchParams.get('page');
```

---

## 🎓 Best Practices

### 1. Use `replace: true` for Auth Navigation
```javascript
// After login, don't allow back button to login page
navigate('/dashboard', { replace: true });
```

### 2. Pass State for Messages
```javascript
navigate('/users', { 
  state: { message: 'User created successfully' } 
});
```

### 3. Handle Loading States
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitForm();
    navigate('/users');
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Validate Before Navigation
```javascript
const handleNavigate = () => {
  if (validateForm()) {
    navigate('/next-page');
  }
};
```

### 5. Use Link for Static Navigation
```javascript
// Use Link for static navigation
<Link to="/users">Users</Link>

// Use navigate for dynamic/conditional navigation
navigate(`/users/${userId}/edit`);
```

---

## 🔗 Navigation in Current Pages

### DashboardPage
- **Navigate to**: Users list, Login
- **Buttons**: "Users", "Logout"

### UserListPage
- **Navigate to**: Create user, Edit user, Dashboard, Login
- **Buttons**: "Create User", "Edit", "Delete", "Dashboard", "Logout"

### UserFormPage
- **Navigate to**: User list
- **Buttons**: "Save", "Cancel"

### LoginPage
- **Navigate to**: Dashboard (on success)
- **Auto-redirect**: If already authenticated

---

## 🎯 Common Navigation Tasks

### Task 1: Navigate After Form Submission
```javascript
const handleSubmit = async (formData) => {
  try {
    await api.createUser(formData);
    navigate('/users');
  } catch (error) {
    setError(error.message);
  }
};
```

### Task 2: Navigate with Confirmation
```javascript
const handleDelete = async (userId) => {
  if (window.confirm('Are you sure?')) {
    await api.deleteUser(userId);
    navigate('/users');
  }
};
```

### Task 3: Navigate Based on Role
```javascript
const handleNavigate = () => {
  if (auth.user.role === 'admin') {
    navigate('/users');
  } else {
    navigate('/403');
  }
};
```

### Task 4: Navigate with Query Parameters
```javascript
const handleFilter = (filter) => {
  navigate(`/users?filter=${filter}`);
};
```

### Task 5: Navigate and Scroll to Top
```javascript
const handleNavigate = () => {
  navigate('/users');
  window.scrollTo(0, 0);
};
```

---

## 📞 Troubleshooting Navigation

### Issue: Page doesn't navigate
**Solution**: Make sure you're using `useNavigate` hook inside a component wrapped by `<BrowserRouter>`

### Issue: Back button doesn't work
**Solution**: Use `navigate(-1)` instead of browser back button

### Issue: State not passed
**Solution**: Use `navigate('/path', { state: { data } })` and read with `useLocation()`

### Issue: Infinite redirect loop
**Solution**: Check your route guards and make sure they don't redirect to themselves

### Issue: Page reloads instead of navigating
**Solution**: Use `<Link>` or `navigate()` instead of `<a href="">`

---

## 🎉 Summary

The Admin Dashboard uses **React Router v6** for navigation with:

✅ **Protected routes** - AccessGuard component
✅ **Programmatic navigation** - useNavigate hook
✅ **Link navigation** - Link component
✅ **URL parameters** - useParams hook
✅ **Query parameters** - useSearchParams hook
✅ **State passing** - useLocation hook

**All navigation is implemented and working!** 🚀
