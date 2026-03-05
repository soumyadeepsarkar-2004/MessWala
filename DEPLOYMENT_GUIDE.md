# Deployment Guide

This guide details how to deploy the MessWala application.

**Architecture:** Frontend on Vercel (static) + Backend on Render (persistent server) + MongoDB Atlas

## 1. Database (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free cluster.
2. Create a database user with read/write access.
3. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere.
4. Copy your connection string (e.g., `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/messwala`).

## 2. Backend Deployment (Render)

1. Push your code to GitHub.
2. Go to [Render](https://render.com/) and click **New** → **Web Service**.
3. Connect your GitHub repository (`MessWala`).
4. Configure the service:
   - **Name:** `messwala`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Set **Environment Variables:**
   | Variable | Value |
   |----------|-------|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A long random string (32+ chars) |
   | `NODE_ENV` | `production` |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `RECAPTCHA_SECRET_KEY` | Your reCAPTCHA v3 secret key |
   | `SMTP_EMAIL` | Gmail address for OTP emails |
   | `SMTP_PASSWORD` | Gmail App Password (not your Gmail password) |
6. Click **Deploy**. Note the URL (e.g., `https://messwala-xxxx.onrender.com`).

> **Note:** Free tier spins down after 15 min of inactivity. First request after idle takes ~30-50s.

## 3. Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com/) and click **Add New** → **Project**.
2. Import your GitHub repository (`MessWala`).
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
4. Set **Environment Variables:**
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your Render backend URL + `/api` (e.g., `https://messwala-xxxx.onrender.com/api`) |
   | `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `VITE_RECAPTCHA_SITE_KEY` | Your reCAPTCHA v3 site key |
5. Click **Deploy**.

## 4. Post-Deployment

1. Open your Vercel URL and verify the login page loads.
2. Try logging in with admin credentials.
3. If CORS errors appear, check that your Vercel domain is in the `ALLOWED_ORIGINS` array in `backend/server.js`.
4. Verify the health endpoint: `https://your-render-url.onrender.com/api/health` should return `{ "status": "ok", "dbState": 1 }`.

## 5. CORS Configuration

The backend allows these origins by default:
- `https://mess-walah.vercel.app`
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000`
- Render's auto-set `RENDER_EXTERNAL_URL`

To add a custom domain, update the `ALLOWED_ORIGINS` array in `backend/server.js`.
