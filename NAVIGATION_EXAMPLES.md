# Navigation Examples - Code Snippets & Implementation

Complete code examples for all navigation scenarios in the Admin Dashboard.

---

## 🎯 Example 1: Navigate from Dashboard to Users

### Scenario
User clicks "Users" button on dashboard to go to user management page.

### Code Implementation

**File**: `client/src/pages/DashboardPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleGoToUsers = () => {
    navigate('/users');
  };

  return (
    <div>
      <button onClick={handleGoToUsers}>
        Users
      </button>
    </div>
  );
}
```

### What Happens
1. User clicks "Users" button
2. `handleGoToUsers()` is called
3. `navigate('/users')` redirects to `/users`
4. `UserListPage` component is rendered
5. User list is displayed

---

## 🎯 Example 2: Navigate from Users to Create User Form

### Scenario
User clicks "Create User" button to open the new user form.

### Code Implementation

**File**: `client/src/pages/UserListPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';

export default function UserListPage() {
  const navigate = useNavigate();

  const handleCreateUser = () => {
    navigate('/users/new');
  };

  return (
    <div>
      <button onClick={handleCreateUser}>
        Create User
      </button>
    </div>
  );
}
```

### What Happens
1. User clicks "Create User" button
2. `handleCreateUser()` is called
3. `navigate('/users/new')` redirects to `/users/new`
4. `UserFormPage` component is rendered in "create" mode
5. Empty form is displayed

---

## 🎯 Example 3: Navigate from Users to Edit User Form

### Scenario
User clicks "Edit" button on a user row to edit that user.

### Code Implementation

**File**: `client/src/pages/UserListPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';

export default function UserListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const handleEditUser = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  return (
    <div>
      <table>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleEditUser(user._id)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### What Happens
1. User clicks "Edit" button on a user row
2. `handleEditUser(userId)` is called with the user's ID
3. `navigate(/users/${userId}/edit)` redirects to `/users/123/edit`
4. `UserFormPage` component is rendered in "edit" mode
5. Form is populated with user data

---

## 🎯 Example 4: Navigate from Form Back to Users List

### Scenario
User clicks "Save" button to submit the form and return to users list.

### Code Implementation

**File**: `client/src/pages/UserFormPage.jsx`

```javascript
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        // Edit existing user
        await axiosClient.put(`/api/users/${id}`, formData);
      } else {
        // Create new user
        await axiosClient.post('/api/users', formData);
      }

      // Navigate back to users list on success
      navigate('/users');
    } catch (error) {
      console.error('Error:', error);
      // Show error message to user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

### What Happens
1. User fills out the form
2. User clicks "Save" button
3. `handleSubmit()` is called
4. Form data is sent to API
5. If successful, `navigate('/users')` redirects to users list
6. User list is displayed with updated data

---

## 🎯 Example 5: Navigate from Form Cancel Button

### Scenario
User clicks "Cancel" button to go back to users list without saving.

### Code Implementation

**File**: `client/src/pages/UserFormPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';

export default function UserFormPage() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <form>
      {/* Form fields */}
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </form>
  );
}
```

### What Happens
1. User clicks "Cancel" button
2. `handleCancel()` is called
3. `navigate('/users')` redirects to users list
4. No data is saved
5. User list is displayed

---

## 🎯 Example 6: Logout and Navigate to Login

### Scenario
User clicks "Logout" button to logout and return to login page.

### Code Implementation

**File**: `client/src/pages/DashboardPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    // Clear authentication state
    auth.logout();

    // Navigate to login page
    // replace: true prevents user from going back to dashboard
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
```

### What Happens
1. User clicks "Logout" button
2. `handleLogout()` is called
3. `auth.logout()` clears the JWT token from localStorage
4. `navigate('/login', { replace: true })` redirects to login page
5. `replace: true` prevents user from using back button to return to dashboard
6. Login page is displayed

---

## 🎯 Example 7: Auto-Redirect Already Authenticated Users

### Scenario
User is already logged in and tries to access `/login` page.

### Code Implementation

**File**: `client/src/pages/LoginPage.jsx`

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Redirect already-authenticated users straight to the dashboard
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div>
      {/* Login form */}
    </div>
  );
}
```

### What Happens
1. User is already authenticated (token in localStorage)
2. User tries to access `/login`
3. `useEffect` runs and checks `auth.isAuthenticated`
4. Since user is authenticated, `navigate('/dashboard', { replace: true })` is called
5. User is redirected to dashboard
6. Login page is never shown

---

## 🎯 Example 8: Protected Route Navigation

### Scenario
Unauthenticated user tries to access `/dashboard`.

### Code Implementation

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

### What Happens
1. Unauthenticated user tries to access `/dashboard`
2. `AccessGuard` component checks `auth.isAuthenticated`
3. Since user is not authenticated, `<Navigate to="/login" replace />` is rendered
4. User is redirected to `/login`
5. Login page is displayed

---

## 🎯 Example 9: Delete User and Stay on Same Page

### Scenario
User clicks "Delete" button to delete a user and stay on users list.

### Code Implementation

**File**: `client/src/pages/UserListPage.jsx`

```javascript
import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function UserListPage() {
  const [users, setUsers] = useState([]);

  const handleDeleteUser = async (userId) => {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      // Delete user via API
      await axiosClient.delete(`/api/users/${userId}`);

      // Remove user from local state
      setUsers(users.filter((user) => user._id !== userId));

      // Show success message
      alert('User deleted successfully');
      // No navigation - stay on same page
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div>
      <table>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>
                <button onClick={() => handleDeleteUser(user._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### What Happens
1. User clicks "Delete" button
2. Confirmation dialog appears
3. If confirmed, `handleDeleteUser()` is called
4. User is deleted via API
5. User is removed from local state
6. Page updates to show remaining users
7. No navigation occurs - user stays on same page

---

## 🎯 Example 10: Navigate with State (Success Message)

### Scenario
After creating a user, navigate to users list and show success message.

### Code Implementation

**File**: `client/src/pages/UserFormPage.jsx`

```javascript
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function UserFormPage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      const response = await axiosClient.post('/api/users', formData);

      // Navigate with state
      navigate('/users', {
        state: {
          message: 'User created successfully',
          userId: response.data.data._id,
        },
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

**File**: `client/src/pages/UserListPage.jsx`

```javascript
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function UserListPage() {
  const location = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Read state from navigation
    if (location.state?.message) {
      setMessage(location.state.message);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  }, [location.state]);

  return (
    <div>
      {message && (
        <div style={{ color: 'green', padding: '10px' }}>
          {message}
        </div>
      )}
      {/* User list */}
    </div>
  );
}
```

### What Happens
1. User submits form to create user
2. User is created successfully
3. `navigate('/users', { state: { message: '...' } })` redirects to users list with state
4. `UserListPage` reads state using `useLocation()`
5. Success message is displayed
6. Message disappears after 3 seconds

---

## 🎯 Example 11: Navigate with Query Parameters

### Scenario
Navigate to users list with pagination parameters.

### Code Implementation

**File**: `client/src/pages/UserListPage.jsx`

```javascript
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function UserListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Read page from query parameters
  useEffect(() => {
    const page = searchParams.get('page') || 1;
    setCurrentPage(parseInt(page));
    fetchUsers(page);
  }, [searchParams]);

  const fetchUsers = async (page) => {
    const response = await axiosClient.get(`/api/users?page=${page}`);
    setUsers(response.data.data.users);
  };

  const handleNextPage = () => {
    navigate(`/users?page=${currentPage + 1}`);
  };

  const handlePreviousPage = () => {
    navigate(`/users?page=${currentPage - 1}`);
  };

  return (
    <div>
      {/* User list */}
      <button onClick={handlePreviousPage}>Previous</button>
      <span>Page {currentPage}</span>
      <button onClick={handleNextPage}>Next</button>
    </div>
  );
}
```

### What Happens
1. User clicks "Next" button
2. `handleNextPage()` is called
3. `navigate(/users?page=2)` updates URL with query parameter
4. `useSearchParams` detects URL change
5. `useEffect` runs and fetches users for page 2
6. Page updates with new users

---

## 🎯 Example 12: Navigate Back

### Scenario
User clicks "Back" button to go to previous page.

### Code Implementation

```javascript
import { useNavigate } from 'react-router-dom';

export default function MyComponent() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back one page
  };

  return (
    <button onClick={handleBack}>
      Back
    </button>
  );
}
```

### What Happens
1. User clicks "Back" button
2. `navigate(-1)` is called
3. Browser goes back one page in history
4. Previous page is displayed

---

## 🎯 Example 13: Conditional Navigation Based on Role

### Scenario
Navigate to different pages based on user role.

### Code Implementation

```javascript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MyComponent() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleNavigate = () => {
    if (auth.user.role === 'admin') {
      navigate('/users');
    } else if (auth.user.role === 'user') {
      navigate('/dashboard');
    } else {
      navigate('/403');
    }
  };

  return (
    <button onClick={handleNavigate}>
      Go to appropriate page
    </button>
  );
}
```

### What Happens
1. User clicks button
2. `handleNavigate()` checks user role
3. Based on role, different page is navigated to
4. Appropriate page is displayed

---

## 🎯 Example 14: Navigate with Loading State

### Scenario
Show loading indicator while navigating and processing data.

### Code Implementation

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function UserFormPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);

    try {
      await axiosClient.post('/api/users', formData);
      navigate('/users');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### What Happens
1. User clicks "Save" button
2. `isLoading` is set to true
3. Button shows "Saving..." and is disabled
4. Form data is sent to API
5. On success, `navigate('/users')` is called
6. `isLoading` is set to false
7. User is redirected to users list

---

## 📊 Navigation Summary Table

| From | To | Method | Code |
|------|-----|--------|------|
| Dashboard | Users | Button | `navigate('/users')` |
| Users | Create Form | Button | `navigate('/users/new')` |
| Users | Edit Form | Button | `navigate(/users/${id}/edit)` |
| Form | Users | Submit | `navigate('/users')` |
| Form | Users | Cancel | `navigate('/users')` |
| Any | Login | Logout | `navigate('/login', { replace: true })` |
| Login | Dashboard | Auto | `navigate('/dashboard', { replace: true })` |
| Any | Previous | Back | `navigate(-1)` |

---

## 🎉 All Navigation Examples Complete!

You now have complete code examples for all navigation scenarios in the Admin Dashboard. Copy and adapt these examples for your specific needs!

**Happy navigating!** 🚀
