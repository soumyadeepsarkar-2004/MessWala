# System Architecture Overview

Complete technical documentation of MessWala's system design and architecture.

---

## 🏗️ System Architecture

MessWala is a **three-tier architecture**:

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (React + Vite)               │
│        Deployed on Vercel (Static)              │
├─────────────────────────────────────────────────┤
│              API GATEWAY (CORS)                 │
├─────────────────────────────────────────────────┤
│         BACKEND (Node.js + Express)             │
│        Deployed on Render (Server)              │
├─────────────────────────────────────────────────┤
│          DATABASE (MongoDB Atlas)               │
│      Cloud-hosted MongoDB Cluster               │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Component Overview

### Frontend Layer
**Technology:** React 18 + Vite + Tailwind CSS

**Responsibilities:**
- User interface rendering
- Form handling and validation
- State management (React Context)
- Client-side authentication (JWT storage)
- API communication

**Key Components:**
```
src/
├─ pages/         # Route pages
├─ components/    # Reusable UI components
├─ services/      # API integration
├─ context/       # Global state (Auth, Config)
└─ App.jsx        # Root component
```

**Build Optimization:**
- Code splitting by route
- Lazy-loaded components
- Vendor chunk separation
- CSS-in-JS with Tailwind mini
- Gzipped size: ~12KB entry point

### Backend Layer
**Technology:** Node.js + Express.js

**Responsibilities:**
- Request routing and handling
- Business logic processing
- Database operations
- Authentication/Authorization
- API response formatting

**Structure:**
```
backend/
├─ src/
│  ├─ controllers/    # Request handlers
│  ├─ models/         # Database schemas
│  ├─ routes/         # Route definitions
│  ├─ middleware/     # Auth, validation
│  └─ utils/          # Helper functions
└─ server.js          # Entry point
```

### Database Layer
**Technology:** MongoDB Atlas

**Responsibilities:**
- Data persistence
- Document storage
- Indexing for performance
- Backup and recovery

**Collections:**
```
messwaladb/
├─ users           # User accounts
├─ expenses        # Expense records
├─ meals           # Menu items
├─ attendance      # Attendance records
├─ feedback        # Meal feedback
└─ messconfig      # Mess configuration
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  collegeId: String,
  room: String,
  phone: String,
  role: String // "admin", "manager", "student"
  status: String // "approved", "pending", "rejected"
  googleId: String, // If Google OAuth
  createdAt: Date,
  updatedAt: Date
}
```

### Expenses Collection

```javascript
{
  _id: ObjectId,
  category: String,
  amount: Number,
  description: String,
  date: Date,
  recordedBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Meals Collection

```javascript
{
  _id: ObjectId,
  date: Date,
  mealType: String // "Breakfast", "Lunch", "Dinner"
  dishes: [String],
  notes: String,
  createdBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  date: Date,
  mealType: String,
  status: String // "present", "absent"
  markedAt: Date,
  createdAt: Date
}
```

### Feedback Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  date: Date,
  mealType: String,
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### MessConfig Collection ⭐ NEW

```javascript
{
  _id: ObjectId,
  messName: String,
  description: String,
  email: String,
  phone: String,
  expenseCategories: [String],
  mealTimes: [
    {
      name: String,
      startTime: String, // "HH:MM"
      endTime: String    // "HH:MM"
    }
  ],
  createdBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Data Flow

### Login Flow

```
User Input (Email/Password)
    ↓
POST /auth/login
    ↓
Validate email exists
    ↓
Compare passwords (bcrypt)
    ↓
Generate JWT token
    ↓
Return token + user info
    ↓
Frontend stores in localStorage
    ↓
Use token in Authorization header
```

### Expense Recording Flow

```
Manager Input (Expense form)
    ↓
POST /expenses with JWT token
    ↓
Verify user is Manager/Treasurer
    ↓
Validate expense data
    ↓
Insert into Expenses collection
    ↓
Return created expense
    ↓
Frontend updates list
    ↓
Student sees in Analytics → Fair share recalculated
```

### Attendance Marking Flow

```
Student marks attendance
    ↓
POST /attendance with JWT
    ↓
Verify user authenticated
    ↓
Check/insert into Attendance
    ↓
Calculate participation rate
    ↓
Trigger fair share recalculation
    ↓
Update Analytics cache (optional)
```

---

## 🔑 Key Features

### Configuration System (NEW in v2.0)

All system configuration stored in `MessConfig`:

```javascript
// Frontend loads this on app start
const config = await fetch('/api/auth/admin/config');
// {
//   messName: "Krishna Bhawan",
//   expenseCategories: ["Vegetables", "Rice", ...],
//   mealTimes: [...]
// }

// Used throughout frontend
<select>
  {config.expenseCategories.map(cat => (
    <option key={cat}>{cat}</option>
  ))}
</select>
```

**Benefits:**
- No hardcoded values
- Admin can update without redeployment
- Scales to multiple messes (future)
- Zero data on fresh deploy

### Authentication & Authorization

**JWT Verification Middleware:**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Role-Based Access Control:**
```javascript
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/expenses', requireRole('manager'), createExpense);
```

### Fair Share Calculation

**Algorithm:**
```
1. Get all expenses for the month
2. Get all active members (attended ≥1 meal)
3. For each member:
   - Count meals attended (all types combined)
   - Share = (Total ÷ Active members) × (Member meals ÷ Total meals)
4. Display per member
```

### Analytics Aggregation

**Real-time calculation:**
```javascript
// On analytics page request:
1. Fetch all expenses for period
2. Fetch all attendance for period
3. Fetch all feedback for period
4. Aggregate:
   - Sum by category
   - Average ratings
   - Attendance percentages
5. Return summarized data
```

---

## 🔐 Security Architecture

### Authentication Layer
- ✅ JWT tokens (7-day expiry)
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Google OAuth integration
- ✅ HTTP-only secure cookies

### API Security
- ✅ CORS whitelist (only allowed origins)
- ✅ Rate limiting (MongoDB-backed)
- ✅ Input validation (all endpoints)
- ✅ Helmet.js (CSP, HSTS, etc.)

### Data Security
- ✅ MongoDB encryption at rest
- ✅ HTTPS in transit
- ✅ No sensitive data in logs
- ✅ Environment variables (no hardcoded secrets)

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Resource-level checks (user can only edit own data)
- ✅ Admin-only endpoints protected
- ✅ Activity logging (optional)

---

## 📊 Database Relationships

```
Users
  ├─ has many Expenses (recordedBy)
  ├─ has many Meals (createdBy)
  ├─ has many Attendance records
  ├─ has many Feedback
  └─ has one MessConfig (createdBy - admin only)

Expenses
  └─ belongs to User (recordedBy)

Meals
  ├─ belongs to User (createdBy)
  └─ has many Attendance records (implicit)

Attendance
  ├─ belongs to User
  └─ references Meals (implicit via date/mealType)

Feedback
  ├─ belongs to User
  └─ references Meals (implicit via date/mealType)

MessConfig
  └─ belongs to Admin User (createdBy)
```

---

## 🚀 Deployment Architecture

### Frontend (Vercel)

```
GitHub Repository
    ↓
Push to branch
    ↓
Vercel detects change
    ↓
Build: npm run build
    ↓
Deploy to CDN
    ↓
https://mess-walah.vercel.app (live)
```

**Environment:**
- `VITE_API_URL` → Backend URL
- `VITE_GOOGLE_CLIENT_ID` → Google OAuth config

### Backend (Render)

```
GitHub Repository
    ↓
Push to branch
    ↓
Render detects change
    ↓
Build: npm install
    ↓
Start: node server.js
    ↓
https://messwala-6jvj.onrender.com (live)
```

**Environment:**
- `MONGO_URI` → Database connection
- `JWT_SECRET` → Token signing key
- `NODE_ENV` → Environment (production)
- Other configs...

### Database (MongoDB Atlas)

```
MongoDB Atlas Cluster
    ↓
Network whitelist: 0.0.0.0/0
    ↓
Database user with R/W access
    ↓
Connection string: mongodb+srv://...
    ↓
Hourly backups (Atlas)
```

---

## 🔄 Scaling Considerations

### Horizontal Scaling

**Future improvements:**
- Microservices for analytics
- Message queue for async tasks
- Cache layer (Redis) for frequent queries
- Load balancer for multiple backend instances

### Vertical Scaling

**Current capacity:**
- Render free tier: ~5000 requests/hour
- MongoDB free tier: 512MB storage
- Suitable for: Single mess (10-100 members)

**Upgrade path:**
- Paid Render plan: 100,000+ requests/hour
- MongoDB paid: Unlimited storage
- Suitable for: Multi-mess platform (1000+ members)

---

## 🛠️ Development Workflow

### Local Setup

```bash
# Backend
cd backend
npm install
npm run dev          # Starts on port 5000

# Frontend
cd frontend
npm install
npm run dev          # Starts on port 5173

# Database
# Use MongoDB Atlas (cloud) or local MongoDB
MONGO_URI=mongodb://localhost:27017/messwala
```

### Code Deployment

```
Feature development on local
    ↓
Push to feature branch
    ↓
Create Pull Request
    ↓
Review & test
    ↓
Merge to main
    ↓
CI/CD deploys automatically
```

---

## 📈 Performance Metrics

### Frontend
- **First Load:** <2 seconds
- **Entry Point:** 12 KB (gzipped)
- **Interactive:** <3 seconds (LCP)

### Backend
- **API Response:** <100ms (average)
- **Database Query:** <50ms (average)
- **p95 Response:** <500ms

### Database
- **Query Performance:** Indexed collections
- **Backup:** Daily snapshots
- **Uptime:** 99.5% SLA (MongoDB Atlas)

---

## 🔍 Monitoring & Observability

**Current:**
- Browser console logs
- Server-side logging to stdout
- Health endpoint: `/api/health`

**Recommended future:**
- Sentry for error tracking
- DataDog for metrics
- ELK stack for log aggregation
- NewRelic for APM

---

**Last Updated:** March 17, 2026  
**Version:** 2.0
