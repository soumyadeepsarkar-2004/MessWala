import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) {
                            return 'vendor-react';
                        } else if (id.includes('react-hot-toast') || id.includes('react-icons')) {
                            return 'vendor-ui';
                        } else if (id.includes('recharts')) {
                            return 'vendor-charts';
                        } else if (id.includes('@react-oauth') || id.includes('react-google-recaptcha')) {
                            return 'vendor-auth';
                        } else if (id.includes('axios')) {
                            return 'vendor-other';
                        }
                        return 'vendor-other';
                    }
                    if (id.includes('LoginPage') || id.includes('OnboardingPage') || id.includes('PendingApprovalPage') || id.includes('ForgotPasswordPage')) {
                        return 'pages-auth';
                    }
                    if (id.includes('DashboardPage') || id.includes('AttendancePage') || id.includes('ExpensesPage') || id.includes('AnalyticsPage')) {
                        return 'pages-main';
                    }
                    if (id.includes('FeedbackPage') || id.includes('MenuPage') || id.includes('TasksPage') || id.includes('StudentManagementPage')) {
                        return 'pages-other';
                    }
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
