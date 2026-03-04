import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

    return children;
};

export default function App() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-300">
            {user && <Navbar />}
            <main className={user ? 'pt-16' : ''}>
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
                    <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                    <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                    <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
                    <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
                </Routes>
            </main>
        </div>
    );
}
