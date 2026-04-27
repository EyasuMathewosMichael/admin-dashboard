# API Documentation

Complete reference for all Admin Dashboard API endpoints.

---

## 📋 Base URL

```
Development:  http://localhost:3001
Production:   https://your-api-domain.com
```

---

## 🔐 Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Getting a Token

1. Call `/api/auth/login` with email and password
2. Receive JWT token in response
3. Include token in all subsequent requests

---

## 📚 Endpoints

### Authentication Endpoints

#### POST /api/auth/login

Login with email and password to receive a JWT token.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-04-26T19:19:47.617Z",
      "updatedAt": "2026-04-26T19:19:47.617Z"
    }
  }
}
```

**Error Responses:**

- **422 Unprocessable Entity** - Missing or invalid email/password
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email and password are required"
  }
}
```

- **401 Unauthorized** - Invalid credentials
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

#### POST /api/auth/logout

Logout the current user (client-side operation).

**Request:**
```
No body required
```

**Response (200 OK):**
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Note:** This endpoint is a no-op on the server. The client should:
1. Remove token from localStorage
2. Clear authentication state
3. Redirect to login page

---

### User Management Endpoints

#### GET /api/users

List all users with pagination.

**Authentication:** Required (Admin role)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 20) - Items per page

**Request:**
```
GET /api/users?page=1&pageSize=20
```

**Response (200 OK):**
```json
{
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "isActive": true,
        "createdAt": "2026-04-26T19:19:47.617Z",
        "updatedAt": "2026-04-26T19:19:47.617Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Regular User",
        "email": "user@example.com",
        "role": "user",
        "isActive": true,
        "createdAt": "2026-04-27T10:30:00.000Z",
        "updatedAt": "2026-04-27T10:30:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User role insufficient (requires admin)

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/users?page=1&pageSize=20" \
  -H "Authorization: Bearer <token>"
```

---

#### POST /api/users

Create a new user.

**Authentication:** Required (Admin role)

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "role": "user",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-04-27T15:45:00.000Z",
    "updatedAt": "2026-04-27T15:45:00.000Z"
  }
}
```

**Error Responses:**

- **422 Unprocessable Entity** - Validation error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name, email, and password are required"
  }
}
```

- **409 Conflict** - Email already exists
```json
{
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email already in use"
  }
}
```

- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User role insufficient (requires admin)

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "role": "user",
    "isActive": true
  }'
```

---

#### PUT /api/users/:id

Update an existing user.

**Authentication:** Required (Admin role)

**URL Parameters:**
- `id` - User ID (MongoDB ObjectId)

**Request:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "isActive": false
}
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "admin",
    "isActive": false,
    "createdAt": "2026-04-26T19:19:47.617Z",
    "updatedAt": "2026-04-27T16:00:00.000Z"
  }
}
```

**Error Responses:**

- **404 Not Found** - User not found
- **409 Conflict** - Email already in use by another user
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User role insufficient (requires admin)

**cURL Example:**
```bash
curl -X PUT http://localhost:3001/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "admin",
    "isActive": false
  }'
```

---

#### DELETE /api/users/:id

Delete a user.

**Authentication:** Required (Admin role)

**URL Parameters:**
- `id` - User ID (MongoDB ObjectId)

**Request:**
```
No body required
```

**Response (200 OK):**
```json
{
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Error Responses:**

- **404 Not Found** - User not found
- **403 Forbidden** - Cannot delete own account (admin self-deletion protection)
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User role insufficient (requires admin)

**cURL Example:**
```bash
curl -X DELETE http://localhost:3001/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

---

### Analytics Endpoints

#### GET /api/analytics/summary

Get user statistics summary.

**Authentication:** Required (Admin role)

**Request:**
```
GET /api/analytics/summary
```

**Response (200 OK):**
```json
{
  "data": {
    "totalUsers": 42,
    "activeUsers": 38,
    "newLast30Days": 5
  }
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User role insufficient (requires admin)

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/analytics/summary \
  -H "Authorization: Bearer <token>"
```

---

#### GET /api/analytics/registrations

Get monthly registration trend for the last 12 months.

**Authentication:** Required (Admin role)

**Request:**
```
GET /api/analytics/registrations
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "month": "2025-05",
      "count": 2
    },
    {
      "month": "2025-06",
      "count": 0
    },
    {
      "month": "2025-07",
      "count": 1
    },
    {
      "month": "2026-04",
      "count": 5
    }
  ]
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User role insufficient (requires admin)

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/analytics/registrations \
  -H "Authorization: Bearer <token>"
```

---

#### GET /api/analytics/roles

Get user count grouped by role.

**Authentication:** Required (Admin role)

**Request:**
```
GET /api/analytics/roles
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "role": "admin",
      "count": 1
    },
    {
      "role": "user",
      "count": 41
    }
  ]
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User role insufficient (requires admin)

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/analytics/roles \
  -H "Authorization: Bearer <token>"
```

---

### Health Check Endpoint

#### GET /api/health

Check if the server is running.

**Authentication:** Not required

**Request:**
```
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/health
```

---

## 🔄 Common Response Formats

### Success Response
```json
{
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## 📊 HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

---

## 🔑 Authentication Details

### JWT Token Structure

JWT tokens consist of three parts separated by dots:
```
header.payload.signature
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1777234161,
  "exp": 1777320561
}
```

### Token Expiry

- **Expiry Time**: 24 hours (86400 seconds)
- **Issued At**: When token is generated
- **Expires At**: 24 hours after issued time

### Refreshing Tokens

Currently, tokens cannot be refreshed. Users must login again when their token expires.

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.data.token')

# Get users
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"

# Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "user",
    "isActive": true
  }'
```

### Using Postman

1. Create a new collection
2. Add requests for each endpoint
3. Set Authorization header: `Bearer {{token}}`
4. Use environment variables for base URL and token
5. Test each endpoint

### Using Insomnia

1. Create a new workspace
2. Add requests for each endpoint
3. Use `Bearer Token` authentication
4. Test each endpoint

---

## 📝 Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:
- Request rate limiting (e.g., 100 requests per minute)
- IP-based rate limiting
- User-based rate limiting

---

## 🔒 Security Notes

1. **Always use HTTPS** in production
2. **Never expose JWT secrets** in client-side code
3. **Validate all inputs** on the server
4. **Use strong passwords** (minimum 8 characters)
5. **Rotate JWT secrets** regularly
6. **Monitor API usage** for suspicious activity
7. **Implement rate limiting** in production
8. **Use CORS** to restrict cross-origin requests

---

## 📞 Support

For API issues:
1. Check the error response message
2. Verify authentication token
3. Check request format
4. Review server logs
5. Verify database connectivity

---

## 🎯 Next Steps

1. Review endpoint documentation
2. Test endpoints with cURL or Postman
3. Integrate with frontend
4. Monitor API performance
5. Set up error tracking

**Happy coding!** 🚀
