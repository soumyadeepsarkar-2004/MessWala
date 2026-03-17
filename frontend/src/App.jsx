import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const PendingApprovalPage = lazy(() => import('./pages/PendingApprovalPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const StudentManagementPage = lazy(() => import('./pages/StudentManagementPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const HomePage = lazy(() => import('./pages/HomePage'));

const PageLoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
    </div>
);

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    // Students: check profile completion and approval
    if (user.role === 'student') {
        if (!user.profileComplete) return <Navigate to="/onboarding" />;
        if (!user.isApproved) return <Navigate to="/pending" />;
    }

    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

    return children;
};

export default function App() {
    const { user } = useAuth();

    // Determine if we should show Navbar (only for approved users accessing main app)
    const showNavbar = user && (user.role !== 'student' || (user.profileComplete && user.isApproved));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-300">
            {showNavbar && <Navbar />}
            <main className={showNavbar ? 'pt-16' : ''}>
                <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
                        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* Student onboarding flow */}
                        <Route path="/onboarding" element={
                            user && user.role === 'student' && !user.profileComplete
                                ? <OnboardingPage />
                                : <Navigate to={user ? '/dashboard' : '/login'} />
                        } />
                        <Route path="/pending" element={
                            user && user.role === 'student' && user.profileComplete && !user.isApproved
                                ? <PendingApprovalPage />
                                : <Navigate to={user ? '/dashboard' : '/login'} />
                        } />

                        {/* Main app routes (require approval for students) */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                        <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                        <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
                        <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
                        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />

                        {/* Admin/Manager routes */}
                        <Route path="/students" element={
                            <ProtectedRoute roles={['admin', 'manager']}>
                                <StudentManagementPage />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}
