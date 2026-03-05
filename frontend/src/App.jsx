import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentManagementPage from './pages/StudentManagementPage';

import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FeedbackPage from './pages/FeedbackPage';
import MenuPage from './pages/MenuPage';
import TasksPage from './pages/TasksPage';
import HomePage from './pages/HomePage';

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
            </main>
        </div>
    );
}
