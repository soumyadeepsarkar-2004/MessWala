# 🍛 MessWala — Hostel Mess Management System

> Transparent, data-driven hostel mess management with real-time cost analytics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/Docs-GitHub%20Pages-blue.svg)](https://soumyadeepsarkar-2004.github.io/MessWala/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](https://github.com/soumyadeepsarkar-2004/MessWala/releases)

**Live App:** [mess-walah.vercel.app](https://mess-walah.vercel.app) | **API:** [messwala-6jvj.onrender.com](https://messwala-6jvj.onrender.com) | **📚 Docs:** [GitHub Pages](https://soumyadeepsarkar-2004.github.io/MessWala/)

MessWala is an open-source hostel mess management system that brings transparency, accountability, and data-driven decision-making to hostel mess operations. Built for real-world use in Indian hostels.

**[📖 Full Documentation →](https://soumyadeepsarkar-2004.github.io/MessWala/)** | [Getting Started](https://soumyadeepsarkar-2004.github.io/MessWala/guides/getting-started/) | [API Docs](https://soumyadeepsarkar-2004.github.io/MessWala/api/endpoints/) | [Deployment Guide](https://soumyadeepsarkar-2004.github.io/MessWala/deployment/setup/)

## ✨ Features

### 🔐 Multi-Role Authentication
- **Google OAuth** — One-click sign-in for students via Google
- **Admin/Manager Login** — Separate credential-based login with reCAPTCHA v3
- **Student Onboarding** — College details, room number, mess preference
- **Manager Approval** — Students require manager/admin approval before accessing the app
- **OTP Password Reset** — Email-based OTP for forgotten passwords

### 🎭 Role-Based Access Control
- **Student** — Mark attendance, rate meals, view analytics
- **Mess Manager** — Set daily menu, view headcount forecasts, manage students
- **Treasurer** — Track expenses, export CSV, manage costs
- **Admin** — Full system access, student approvals

### 📊 Cost Analytics Dashboard
- Monthly expense trends
- Ingredient category breakdown (donut chart)
- Cost per plate tracking
- Wastage estimation
- **Mess Transparency Index** — A unique score based on data entry frequency

### 🔮 Predictive Cost Estimator
- Linear regression on historical data
- Predicts next month's expense
- Helps with budget planning

### 📋 Additional Modules
- Daily meal attendance with skip option
- Menu management (weekly calendar)
- Feedback system with star ratings
- Anonymous commenting
- Task management with assignments
- CSV export for accounting

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts, PWA |
| Backend | Node.js, Express.js, Helmet |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT, Google OAuth, reCAPTCHA v3, bcrypt |
| Email | Nodemailer (Gmail SMTP) |
| Rate Limiting | express-rate-limit + MongoDB store |
| Frontend Hosting | Vercel (static) |
| Backend Hosting | Render (persistent server) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/soumyadeepsarkar-2004/MessWala.git
cd MessWala

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend server
npm run dev
```

```bash
# In a new terminal — Install & start frontend
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL and Google OAuth credentials
npm run dev
```

Open http://localhost:5173 in your browser.

### First-Time Setup

1. **Register as Admin** — The first user to sign up becomes the admin
2. **Configure Mess** — Use the Setup Wizard to name your mess, set meal times, and configure preferences
3. **Invite Users** — Share the app link with students, managers, and treasurers
4. **Approve Students** — Admins/Managers approve student registrations from the dashboard

### Development Seed Data (Optional)

For development/testing only, you can populate the database with sample data:

```bash
cd backend
ALLOW_SEED=true npm run seed
```

> ⚠️ **Warning:** The seed script clears ALL existing data. Never run in production.

## 📁 Project Structure

```
MessWala/
├── backend/
│   ├── server.js              # Express server + middleware
│   ├── src/
│   │   ├── models/            # Mongoose schemas
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, role & approval guards
│   │   ├── utils/             # Prediction algorithm, email
│   │   └── seed/              # Sample data generator
├── frontend/
│   ├── src/
│   │   ├── pages/             # Route-level pages
│   │   ├── components/        # Reusable UI
│   │   ├── context/           # Auth context (JWT + Google)
│   │   └── services/          # API layer (Axios)
│   └── index.html
├── vercel.json                # Frontend deployment config
├── render.yaml                # Backend deployment blueprint
├── DEPLOYMENT_GUIDE.md        # Full deployment instructions
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/admin/login` | — | Admin/Manager/Treasurer login |
| POST | `/api/auth/google` | — | Google OAuth for students |
| POST | `/api/auth/complete-profile` | ✅ | Student onboarding |
| POST | `/api/auth/admin/forgot-password` | — | Request OTP |
| POST | `/api/auth/admin/verify-otp` | — | Verify OTP |
| POST | `/api/auth/admin/reset-password` | — | Reset password |
| GET | `/api/auth/profile` | ✅ | Get profile |
| GET | `/api/auth/students/pending` | Manager+ | Pending student approvals |
| PATCH | `/api/auth/students/:id/approve` | Manager+ | Approve student |
| POST | `/api/meals/mark` | ✅ | Mark attendance |
| GET | `/api/meals/headcount` | Manager+ | Daily headcount |
| POST | `/api/expenses` | Treasurer+ | Add expense |
| GET | `/api/expenses/cost-per-plate` | ✅ | Cost per plate |
| GET | `/api/expenses/export` | Treasurer+ | CSV export |
| GET | `/api/analytics/transparency-index` | ✅ | Transparency score |
| GET | `/api/analytics/predicted-cost` | ✅ | ML prediction |
| POST | `/api/feedback` | ✅ | Rate meal |
| POST | `/api/menu` | Manager+ | Set menu |
| GET | `/api/tasks` | ✅ | List tasks |
| POST | `/api/tasks` | Manager+ | Create task |

## 📚 Documentation

Comprehensive documentation is available at: **[GitHub Pages](https://soumyadeepsarkar-2004.github.io/MessWala/)**

- **[User Guide](https://soumyadeepsarkar-2004.github.io/MessWala/guides/getting-started/)** — How to use MessWala
- **[API Reference](https://soumyadeepsarkar-2004.github.io/MessWala/api/endpoints/)** — Complete API documentation (25+ endpoints)
- **[Deployment Guide](https://soumyadeepsarkar-2004.github.io/MessWala/deployment/setup/)** — Deploy to Vercel/Render/MongoDB
- **[Architecture](https://soumyadeepsarkar-2004.github.io/MessWala/architecture/system-overview/)** — System design & database schema
- **[Troubleshooting](https://soumyadeepsarkar-2004.github.io/MessWala/deployment/troubleshooting/)** — 50+ common issues & solutions
- **[Admin Guide](https://soumyadeepsarkar-2004.github.io/MessWala/admin/setup-wizard/)** — Mess configuration & user management

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code guidelines and [DOCS_CONTRIBUTING.md](DOCS_CONTRIBUTING.md) for documentation guidelines.

## 📄 License

MIT — see [LICENSE](LICENSE)

---

Built with ❤️ for hostel students everywhere.
