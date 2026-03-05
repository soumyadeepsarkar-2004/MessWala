import { useAuth } from '../context/AuthContext';
import { HiOutlineClock, HiOutlineLogout } from 'react-icons/hi';

export default function PendingApprovalPage() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative animate-fade-in text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 mb-6">
                    <HiOutlineClock className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pending Approval</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Hi <span className="font-semibold text-primary-500">{user?.name}</span>, your profile has been submitted successfully.
                    The mess manager will review and approve your account shortly.
                </p>

                <div className="glass-card-solid p-6 mb-6 text-left">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Name</span>
                            <span className="font-medium text-gray-900 dark:text-white">{user?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                            <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
                        </div>
                        {user?.collegeId && (
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">College ID</span>
                                <span className="font-medium text-gray-900 dark:text-white">{user.collegeId}</span>
                            </div>
                        )}
                        {user?.roomNumber && (
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Room</span>
                                <span className="font-medium text-gray-900 dark:text-white">{user.roomNumber}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Mess No.</span>
                            <span className="font-medium text-amber-500">Not assigned yet</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card-solid p-4 mb-6 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        You'll be able to access the platform once the manager approves your registration and assigns you a mess number.
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="btn-secondary inline-flex items-center gap-2"
                >
                    <HiOutlineLogout className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
