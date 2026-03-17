import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['react-hot-toast', 'react-icons'],
                    'vendor-charts': ['recharts'],
                    'vendor-auth': ['@react-oauth/google', 'react-google-recaptcha-v3'],
                    'vendor-other': ['axios'],
                    'pages-auth': ['./src/pages/LoginPage.jsx', './src/pages/OnboardingPage.jsx', './src/pages/PendingApprovalPage.jsx', './src/pages/ForgotPasswordPage.jsx'],
                    'pages-main': ['./src/pages/DashboardPage.jsx', './src/pages/AttendancePage.jsx', './src/pages/ExpensesPage.jsx', './src/pages/AnalyticsPage.jsx'],
                    'pages-other': ['./src/pages/FeedbackPage.jsx', './src/pages/MenuPage.jsx', './src/pages/TasksPage.jsx', './src/pages/StudentManagementPage.jsx'],
                },
            },
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['messwala-icon.svg'],
            manifest: {
                name: 'MessWala — Hostel Mess Management',
                short_name: 'MessWala',
                description: 'Transparent hostel mess management with real-time cost analytics, meal tracking, and feedback.',
                theme_color: '#f9a825',
                background_color: '#0f172a',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                    },
                    {
                        src: 'pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                    },
                    {
                        src: 'pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
