# API Endpoints Reference

Complete API endpoint documentation for MessWala backend.

---

## Base URL

**Production:** `https://messwala-6jvj.onrender.com/api`  
**Development:** `http://localhost:5000/api`

---

## 🔐 Authentication

### Headers Required
```json
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Getting a Token

**POST `/auth/login`**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response includes `token` for subsequent requests.

---

## 📋 Endpoints Overview

| Category | Endpoint | Method | Auth Required |
|----------|----------|--------|---------------|
| **Auth** | `/auth/register` | POST | No |
| | `/auth/login` | POST | No |
| | `/auth/google` | POST | No |
| | `/auth/logout` | POST | Yes |
| | `/auth/verify` | GET | Yes |
| | `/auth/admin/setup` | POST | Yes (Admin) |
| | `/auth/admin/config` | GET | No |
| **Expenses** | `/expenses` | GET | Yes |
| | `/expenses` | POST | Yes (Manager) |
| | `/expenses/:id` | GET | Yes |
| | `/expenses/:id` | PUT | Yes |
| | `/expenses/:id` | DELETE | Yes |
| **Meals** | `/meals` | GET | Yes |
| | `/meals` | POST | Yes (Manager) |
| | `/meals/:id` | PUT | Yes |
| | `/meals/:id` | DELETE | Yes |
| **Attendance** | `/attendance` | GET | Yes |
| | `/attendance` | POST | Yes |
| | `/attendance/:id` | PUT | Yes |
| **Feedback** | `/feedback` | GET | Yes |
| | `/feedback` | POST | Yes |
| | `/feedback/:id` | PUT | Yes |
| **Analytics** | `/analytics/expenses` | GET | Yes (Manager) |
| | `/analytics/attendance` | GET | Yes (Manager) |
| | `/analytics/health` | GET | Yes (Manager) |
| **Users** | `/users` | GET | Yes (Admin) |
| | `/users/:id` | GET | Yes |
| | `/users/:id` | PUT | Yes |
| | `/users/:id/role` | PUT | Yes (Admin) |
| | `/users/:id/approve` | PUT | Yes (Admin) |
| | `/users/:id/reject` | PUT | Yes (Admin) |
| **Health** | `/health` | GET | No |

---

## 🔑 Auth Endpoints

### POST `/auth/register`
Register a new user (student role by default).

**Request:**
```json
{
  "email": "john@college.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "collegeId": "CSE001",
  "room": "A-201",
  "phone": "9876543210"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful. Awaiting admin approval.",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Errors:**
- `400` — Missing required fields
- `409` — Email already registered
- `500` — Server error

---

### POST `/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "john@college.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@college.com",
    "fullName": "John Doe",
    "role": "student",
    "status": "approved"
  }
}
```

**Errors:**
- `401` — Invalid email or password
- `403` — User not approved (pending)
- `404` — User not found

---

### POST `/auth/google`
Authenticate with Google OAuth.

**Request:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsIkN..."
}
```

Response: Same as `/login`

---

### POST `/auth/logout`
Logout current user (clears session).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/auth/verify`
Verify JWT token validity.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:** `200 OK`
```json
{
  "valid": true,
  "user": { /* user object */ }
}
```

---

### POST `/auth/admin/setup` ⭐ NEW
Configure mess settings (admin only, first-time only).

**Auth:** Admin role required

**Request:**
```json
{
  "messName": "Krishna Bhawan",
  "description": "Main hostel mess",
  "email": "mess@college.com",
  "phone": "9876543210",
  "expenseCategories": [
    "Vegetables",
    "Rice",
    "Gas",
    "Salary",
    "Dairy",
    "Spices",
    "WiFi"
  ],
  "mealTimes": [
    {
      "name": "Breakfast",
      "startTime": "07:30",
      "endTime": "09:00"
    },
    {
      "name": "Lunch",
      "startTime": "12:30",
      "endTime": "14:00"
    },
    {
      "name": "Dinner",
      "startTime": "19:30",
      "endTime": "21:00"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "config": {
    "_id": "507f1f77bcf86cd799439011",
    "messName": "Krishna Bhawan",
    "expenseCategories": [...],
    "mealTimes": [...]
  }
}
```

**Errors:**
- `403` — Not admin role
- `400` — Missing required fields
- `409` — Config already exists

---

### GET `/auth/admin/config`
Fetch mess configuration (public, no auth).

**Response:** `200 OK`
```json
{
  "success": true,
  "config": {
    "messName": "Krishna Bhawan",
    "description": "Main hostel mess",
    "email": "mess@college.com",
    "phone": "9876543210",
    "expenseCategories": ["Vegetables", "Rice", ...],
    "mealTimes": [...]
  }
}
```

---

## 💰 Expense Endpoints

### GET `/expenses`
Fetch all expenses (paginated).

**Query Params:**
- `page` — Page number (default: 1)
- `limit` — Per page (default: 10)
- `category` — Filter by category
- `startDate` — YYYY-MM-DD format
- `endDate` — YYYY-MM-DD format

**Response:** `200 OK`
```json
{
  "success": true,
  "expenses": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "category": "Vegetables",
      "amount": 500,
      "description": "Weekly vegetables",
      "date": "2024-01-15",
      "recordedBy": { "fullName": "Manager Name" },
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}
```

---

### POST `/expenses`
Create new expense (manager/treasurer).

**Auth:** Manager or Treasurer role required

**Request:**
```json
{
  "category": "Vegetables",
  "amount": 500,
  "description": "Weekly vegetables from market",
  "date": "2024-01-15"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "expense": { /* expense object */ }
}
```

---

### GET `/expenses/:id`
Fetch single expense.

**Response:** `200 OK`
```json
{
  "success": true,
  "expense": { /* expense object */ }
}
```

---

### PUT `/expenses/:id`
Update expense (own records only).

**Request:** Same fields as POST

**Response:** `200 OK`

---

### DELETE `/expenses/:id`
Delete expense.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

## 🍽️ Meal Endpoints

### GET `/meals`
Fetch meals/menu items.

**Query Params:**
- `date` — YYYY-MM-DD specific date
- `week` — Week number
- `mealType` — "Breakfast", "Lunch", or "Dinner"

**Response:** `200 OK`
```json
{
  "success": true,
  "meals": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "date": "2024-01-15",
      "mealType": "Breakfast",
      "dishes": ["Dosa", "Sambar", "Chutney"],
      "notes": "South Indian special",
      "createdBy": { "fullName": "Manager" }
    }
  ]
}
```

---

### POST `/meals`
Create menu item (manager).

**Auth:** Manager role required

**Request:**
```json
{
  "date": "2024-01-15",
  "mealType": "Breakfast",
  "dishes": ["Dosa", "Sambar"],
  "notes": "Spicy level: Medium"
}
```

**Response:** `201 Created`

---

### PUT `/meals/:id` & DELETE `/meals/:id`
Similar to expenses endpoints.

---

## ✋ Attendance Endpoints

### GET `/attendance`
Fetch attendance records.

**Query Params:**
- `userId` — Filter by user
- `date` — YYYY-MM-DD
- `month` — YYYY-MM format
- `status` — "present" or "absent"

**Response:** `200 OK`
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "date": "2024-01-15",
      "mealType": "Breakfast",
      "status": "present",
      "markedAt": "2024-01-15T07:45:00Z"
    }
  ]
}
```

---

### POST `/attendance`
Mark attendance for a meal.

**Request:**
```json
{
  "date": "2024-01-15",
  "mealType": "Breakfast",
  "status": "present"
}
```

**Response:** `201 Created`

---

## 💬 Feedback Endpoints

### GET `/feedback`
Fetch all feedback.

**Query Params:**
- `mealType` — "Breakfast", "Lunch", "Dinner"
- `date` — YYYY-MM-DD
- `rating` — 1 to 5

**Response:** `200 OK`
```json
{
  "success": true,
  "feedback": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": { "fullName": "John Doe" },
      "date": "2024-01-15",
      "mealType": "Breakfast",
      "rating": 4,
      "comment": "Delicious dosa!",
      "createdAt": "2024-01-15T08:30:00Z"
    }
  ]
}
```

---

### POST `/feedback`
Submit meal feedback.

**Request:**
```json
{
  "date": "2024-01-15",
  "mealType": "Breakfast",
  "rating": 4,
  "comment": "Very tasty, would eat again"
}
```

**Response:** `201 Created`

---

## 📊 Analytics Endpoints

### GET `/analytics/expenses`
Expense analytics (manager+).

**Query Params:**
- `month` — YYYY-MM format
- `year` — YYYY format

**Response:** `200 OK`
```json
{
  "success": true,
  "analytics": {
    "totalExpenses": 15000,
    "monthlyAverage": 2500,
    "categoryBreakdown": {
      "Vegetables": 5000,
      "Rice": 4000,
      "Gas": 3000
    },
    "trend": [
      { "month": "2023-11", "amount": 2400 },
      { "month": "2023-12", "amount": 2600 }
    ]
  }
}
```

---

### GET `/analytics/attendance`
Attendance analytics.

**Response:** `200 OK`
```json
{
  "success": true,
  "analytics": {
    "totalMembers": 20,
    "averageAttendance": 18,
    "attendanceRate": 0.9,
    "byMealType": {
      "Breakfast": 0.85,
      "Lunch": 0.95,
      "Dinner": 0.88
    }
  }
}
```

---

### GET `/analytics/health`
Health score (overall system metrics).

**Response:** `200 OK`
```json
{
  "success": true,
  "healthScore": {
    "mealQuality": 4.2,
    "attendanceRate": 0.9,
    "fairShareIndex": 0.85,
    "overallScore": 4.0
  }
}
```

---

## 👥 User Endpoints

### GET `/users`
List all users (admin).

**Auth:** Admin role required

**Query Params:**
- `status` — "approved", "pending", "rejected"
- `role` — "student", "manager", "treasurer", "admin"

**Response:** `200 OK`
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@college.com",
      "fullName": "John Doe",
      "role": "student",
      "status": "approved",
      "collegeId": "CSE001",
      "createdAt": "2024-01-10T00:00:00Z"
    }
  ]
}
```

---

### GET `/users/:id`
Get user profile.

**Response:** `200 OK` (user object)

---

### PUT `/users/:id`
Update own profile.

**Request:**
```json
{
  "fullName": "John Doe",
  "phone": "9876543210"
}
```

---

### PUT `/users/:id/role` (Admin)
Change user role.

**Request:**
```json
{
  "role": "manager"
}
```

---

### PUT `/users/:id/approve` (Admin)
Approve pending user.

**Response:** `200 OK`

---

### PUT `/users/:id/reject` (Admin)
Reject pending user.

**Response:** `200 OK`

---

## 📌 Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden (no permission) |
| `404` | Not Found |
| `409` | Conflict |
| `500` | Server Error |

---

## ✅ Health Check

### GET `/health`
System status.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "dbState": 1,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## 🆕 v2.0 Changes

✅ New endpoints:
- `POST /auth/admin/setup` — Configure mess
- `GET /auth/admin/config` — Fetch config

✅ All APIs now use dynamic configuration from database

---

**Last Updated:** March 17, 2026  
**Version:** 2.0
