# Deployment Guide

This guide details how to deploy your MessWala application.

## 1. Backend Deployment (Railway)

1.  **Push your code to GitHub.** Ensure the latest changes are committed.
2.  **Log in to [Railway](https://railway.app/).**
3.  Click **New Project** -> **Deploy from GitHub repo**.
4.  Select your repository (`MessWala`).
5.  **Configure the Service:**
    *   Railway might try to deploy the root. You need to configure it to deploy the `backend` folder.
    *   Go to **Settings** -> **Root Directory** and set it to `/backend`.
6.  **Set Environment Variables:**
    *   Go to the **Variables** tab.
    *   Add the following variables:
        *   `MONGO_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas).
        *   `JWT_SECRET`: A long, random string for security.
        *   `PORT`: `5000` (Optional, Railway provides one, but good to be explicit or let it default).
    *   **Crucial:** Ensure your MongoDB Atlas cluster allows connections from anywhere (`0.0.0.0/0`) or configure Railway IP ranges if you prefer. To whitelist all IPs:
        1.  Go to MongoDB Atlas -> Network Access.
        2.  Click **Add IP Address**.
        3.  Select **Allow Access from Anywhere**.
7.  **Generate Domain:**
    *   Go to **Settings** -> **Networking** -> **Generate Domain**.
    *   Copy this URL (e.g., `https://messwala-production.up.railway.app`). You will need it for the frontend.

## 2. Frontend Deployment (Vercel)

1.  **Log in to [Vercel](https://vercel.com/).**
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository (`MessWala`).
4.  **Configure Project:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** Click "Edit" and select `frontend`.
5.  **Set Environment Variables:**
    *   Expand **Environment Variables**.
    *   Add `VITE_API_URL` and set the value to your Railway Backend URL (e.g., `https://messwala-production.up.railway.app`).
    *   **Important:** Do not add a trailing slash `/` to the URL if your code appends `/api`. (e.g. use `https://...app` not `https://...app/`).
        *   *Note:* The code defaults to appending `/api` in some places, but `baseURL` config handles the base.
        *   If your `VITE_API_URL` is `https://my-backend.railway.app`, requests will go to `https://my-backend.railway.app/auth/login` etc.
6.  **Deploy:** Click **Deploy**.

## 3. Post-Deployment Checks

1.  Open your Vercel URL.
2.  Try to Register/Login.
3.  If you see CORS errors:
    *   Check your backend logs in Railway.
    *   Update `backend/server.js` to whitelist your Vercel domain if necessary (currently allows all origins).
