import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineHome, HiOutlineClipboardCheck, HiOutlineCurrencyRupee, HiOutlineChartBar, HiOutlineStar, HiOutlineCalendar, HiOutlineClipboardList, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineMoon, HiOutlineSun, HiOutlineUserGroup } from 'react-icons/hi';

const baseNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/attendance', label: 'Attendance', icon: HiOutlineClipboardCheck },
    { path: '/expenses', label: 'Expenses', icon: HiOutlineCurrencyRupee },
    { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
    { path: '/feedback', label: 'Feedback', icon: HiOutlineStar },
    { path: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
    { path: '/menu', label: 'Menu', icon: HiOutlineCalendar },
];

export default function Navbar() {
    const { user, logout } = useAuth();

    // Add Students link for admin/manager
    const navItems = [...baseNavItems];
    if (user && ['admin', 'manager'].includes(user.role)) {
        navItems.push({ path: '/students', label: 'Students', icon: HiOutlineUserGroup });
    }
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    const toggleDark = () => {
        document.documentElement.classList.toggle('dark');
        setDark(!dark);
    };

    const roleBadge = {
        student: 'badge-student',
        manager: 'badge-manager',
        treasurer: 'badge-treasurer',
        admin: 'badge-admin',
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-dark-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <span className="text-2xl">🍛</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent group-hover:from-primary-400 group-hover:to-primary-600 transition-all">
                            MessWala
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === path
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleDark}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                            id="dark-mode-toggle"
                        >
                            {dark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                        </button>

                        <div className="hidden md:flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                                <span className={roleBadge[user?.role] || 'badge'}>{user?.role}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                                id="logout-btn"
                                title="Logout"
                            >
                                <HiOutlineLogout className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                            id="mobile-menu-toggle"
                        >
                            {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="fixed top-16 right-0 w-64 h-full bg-white dark:bg-dark-900 shadow-2xl p-4 animate-slide-down">
                        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-gray-50 dark:bg-dark-800">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                <span className={roleBadge[user?.role] || 'badge'}>{user?.role}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === path
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </Link>
                            ))}
                        </div>

                        <button
                            onClick={logout}
                            className="w-full mt-6 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <HiOutlineLogout className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
