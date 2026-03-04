# 🍛 MessWala — Hostel Mess Management System

> Transparent, data-driven hostel mess management with real-time cost analytics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MessWala is an open-source hostel mess management system that brings transparency, accountability, and data-driven decision-making to hostel mess operations. Built for real-world use in Indian hostels.

## ✨ Features

### 🔐 Role-Based Access Control
- **Student** — Mark attendance, rate meals, view analytics
- **Mess Manager** — Set daily menu, view headcount forecasts
- **Treasurer** — Track expenses, export CSV, manage costs
- **Admin** — Full system access

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
- CSV export for accounting

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| UI | Glassmorphism, dark mode, micro-animations |

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
# Edit .env with your MongoDB URI

# Seed sample data (60 days, 10 users)
npm run seed

# Start backend server
npm run dev
```

```bash
# In a new terminal — Install & start frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@messwala.com | admin123 |
| Manager | manager@messwala.com | manager123 |
| Treasurer | treasurer@messwala.com | treasurer123 |
| Student | arjun@messwala.com | student123 |

## 📁 Project Structure

```
MessWala/
├── backend/
│   ├── server.js              # Express server
│   ├── src/
│   │   ├── models/            # Mongoose schemas
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth & role guards
│   │   ├── utils/             # Prediction algorithm
│   │   └── seed/              # Sample data generator
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/             # Route-level pages
│   │   ├── components/        # Reusable UI
│   │   ├── context/           # Auth context
│   │   └── services/          # API layer
│   └── index.html
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/profile` | ✅ | Get profile |
| POST | `/api/meals/mark` | ✅ | Mark attendance |
| GET | `/api/meals/headcount` | Manager+ | Daily headcount |
| POST | `/api/expenses` | Treasurer+ | Add expense |
| GET | `/api/expenses/cost-per-plate` | ✅ | Cost per plate |
| GET | `/api/expenses/export` | Treasurer+ | CSV export |
| GET | `/api/analytics/transparency-index` | ✅ | Transparency score |
| GET | `/api/analytics/predicted-cost` | ✅ | ML prediction |
| POST | `/api/feedback` | ✅ | Rate meal |
| POST | `/api/menu` | Manager+ | Set menu |

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT — see [LICENSE](LICENSE)

---

Built with ❤️ for hostel students everywhere.
