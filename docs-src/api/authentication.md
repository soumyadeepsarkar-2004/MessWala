# API Authentication Guide

Complete guide to authenticating with the MessWala API.

---

## 🔐 Overview

MessWala uses **JWT (JSON Web Tokens)** for authentication combined with optional Google OAuth.

**Methods:**
1. Email/Password login → JWT token
2. Google OAuth → JWT token
3. Token refresh on expiry
4. Session management

---

## JWT Token Structure

A JWT token consists of 3 parts: `header.payload.signature`

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Token Validity:**
- Valid for **7 days**
- Automatically issued on login
- Can be manually refreshed

---

## 1️⃣ Email/Password Authentication

### Step 1: Register

**POST `/auth/register`**

```bash
curl -X POST https://messwala-6jvj.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@college.com",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "collegeId": "CSE001",
    "room": "A-201",
    "phone": "9876543210"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Awaiting admin approval.",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Important:** After registration, you must wait for admin approval before logging in.

---

### Step 2: Login

**POST `/auth/login`**

```bash
curl -X POST https://messwala-6jvj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@college.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
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

---

### Step 3: Use Token in Requests

**Include token in Authorization header:**

```bash
curl -X GET https://messwala-6jvj.onrender.com/api/expenses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Or in JavaScript:**

```javascript
const token = localStorage.getItem('token');

fetch('https://messwala-6jvj.onrender.com/api/expenses', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 2️⃣ Google OAuth Authentication

### Prerequisites

- Google account
- Google OAuth Client ID configured

### Step 1: Get Google ID Token

Use Google Sign-In library in your frontend:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>

<div id="g_id_onload"
  data-client_id="YOUR_GOOGLE_CLIENT_ID"
  data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
  function handleCredentialResponse(response) {
    // response.credential is the ID token
    authenticateWithGoogle(response.credential);
  }
</script>
```

### Step 2: Send Token to BackEnd

**POST `/auth/google`**

```bash
curl -X POST https://messwala-6jvj.onrender.com/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJSUzI1NiIsIkN..."
  }'
```

**Response:** (Same as email/password login)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

## 3️⃣ Token Management

### Storing the Token

**Frontend (JavaScript):**

```javascript
// After login, store token
localStorage.setItem('token', response.token);
// Or in session (cleared on browser close)
sessionStorage.setItem('token', response.token);
```

### Verifying Token

**GET `/auth/verify`**

```bash
curl -X GET https://messwala-6jvj.onrender.com/api/verify \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

### Refreshing Token

Currently: Generate new token by logging in again

**Future:** Token refresh endpoint (TBD)

### Logout

**POST `/auth/logout`**

```bash
curl -X POST https://messwala-6jvj.onrender.com/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

**Frontend cleanup:**

```javascript
// Clear token from storage
localStorage.removeItem('token');
// Redirect to login
window.location.href = '/login';
```

---

## 4️⃣ Common Authentication Scenarios

### Scenario 1: Student Marks Attendance

```javascript
const token = localStorage.getItem('token');

const response = await fetch(
  'https://messwala-6jvj.onrender.com/api/attendance',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: '2024-01-15',
      mealType: 'Breakfast',
      status: 'present'
    })
  }
);

const data = await response.json();
console.log(data.success); // true or false
```

### Scenario 2: Manager Views Analytics

```javascript
const token = localStorage.getItem('token');

const response = await fetch(
  'https://messwala-6jvj.onrender.com/api/analytics/expenses?month=2024-01',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data.analytics);
```

### Scenario 3: Enable Notifications

```javascript
// Check token validity on app start
async function validateSession() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // No token, redirect to login
    window.location.href = '/login';
    return false;
  }
  
  const response = await fetch(
    'https://messwala-6jvj.onrender.com/api/verify',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (!response.ok) {
    // Token invalid, clear and redirect
    localStorage.removeItem('token');
    window.location.href = '/login';
    return false;
  }
  
  return true;
}

// Call on app load
window.addEventListener('load', validateSession);
```

---

## ⚠️ Security Best Practices

### DO:
✅ **Store in secure storage**
- Use HTTP-only cookies (server-side)
- LocalStorage for web apps (JavaScript)
- Keychain for native apps

✅ **Use HTTPS only**
- Always use `https://` not `http://`
- Tokens transmitted over encrypted connection

✅ **Validate tokens**
- Verify token signature server-side
- Check expiry time
- Validate user permissions

✅ **Implement logout**
- Clear token on logout
- Invalidate token on server if possible
- Revoke refresh tokens

✅ **Handle errors gracefully**
- Redirect on 401 (unauthorized)
- Show friendly error messages
- Log security issues

### DON'T:
❌ **Store in cookies (unless HTTP-only)**
- Vulnerable to XSS attacks
- Client-side cookies accessible to JavaScript

❌ **Expose token in URLs**
```javascript
// ❌ WRONG
fetch(`/api/data?token=${token}`);

// ✅ CORRECT
fetch('/api/data', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

❌ **Hardcode tokens**
```javascript
// ❌ WRONG
const STATIC_TOKEN = 'eyJhbGc...';

// ✅ CORRECT
const token = localStorage.getItem('token');
```

❌ **Use for multiple purposes**
- One token per app/device
- Don't share across services
- Rotate periodically

---

## 🔧 Integration Examples

### JavaScript/Fetch

```javascript
class MessWalaAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Token expired
      throw new Error('Unauthorized - please login again');
    }

    return response.json();
  }

  async getExpenses() {
    return this.request('/expenses');
  }

  async addExpense(category, amount, description) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify({ category, amount, description })
    });
  }
}

// Usage
const api = new MessWalaAPI(
  'https://messwala-6jvj.onrender.com/api',
  localStorage.getItem('token')
);

api.getExpenses().then(console.log);
```

### Python/Requests

```python
import requests

class MessWalaAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def get_expenses(self):
        response = requests.get(
            f'{self.base_url}/expenses',
            headers=self.headers
        )
        return response.json()

    def add_expense(self, category, amount, description):
        response = requests.post(
            f'{self.base_url}/expenses',
            headers=self.headers,
            json={
                'category': category,
                'amount': amount,
                'description': description
            }
        )
        return response.json()

# Usage
api = MessWalaAPI(
    'https://messwala-6jvj.onrender.com/api',
    'YOUR_TOKEN_HERE'
)
print(api.get_expenses())
```

---

## ❓ FAQ

**Q: How long is a token valid?**
A: 7 days from issue. Refresh by logging in again.

**Q: What if my token expires?**
A: You'll get a 401 error. Redirect user to login page.

**Q: Can I revoke a token?**
A: Not directly. User must change password to invalidate all tokens.

**Q: Is it safe to use Google OAuth?**
A: Yes, Google handles authentication securely.

**Q: Can I use token across devices?**
A: Yes, same token works from multiple devices.

**Q: What if someone gets my token?**
A: Use HTTPS only and store securely. Logout invalidates it.

---

**Last Updated:** March 17, 2026  
**Version:** 2.0
