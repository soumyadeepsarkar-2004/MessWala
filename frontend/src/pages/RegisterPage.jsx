import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineHome } from 'react-icons/hi';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', roomNumber: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created! Welcome to MessWala 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30 mb-4">
                        <span className="text-3xl">🍛</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join MessWala</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Create your account</p>
                </div>

                <div className="glass-card-solid p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                            <div className="relative">
                                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" className="input-field pl-10" required id="register-name" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@messwala.com" className="input-field pl-10" required id="register-email" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="input-field pl-10" required minLength={6} id="register-password" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                                <select name="role" value={form.role} onChange={handleChange} className="input-field" id="register-role">
                                    <option value="student">Student</option>
                                    <option value="manager">Manager</option>
                                    <option value="treasurer">Treasurer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Room No.</label>
                                <div className="relative">
                                    <HiOutlineHome className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="B-201" className="input-field pl-10" id="register-room" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2" id="register-submit">
                            {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
