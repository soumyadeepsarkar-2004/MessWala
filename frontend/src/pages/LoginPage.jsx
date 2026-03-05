import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const { googleLogin } = useAuth();
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            let captchaToken = '';
            if (executeRecaptcha) {
                captchaToken = await executeRecaptcha('login');
            }
            await googleLogin(credentialResponse.credential, captchaToken);
            toast.success('Welcome to MessWala! 🍛');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100/20 dark:bg-yellow-900/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30 mb-4">
                        <span className="text-3xl">🍛</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to MessWala</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Your hostel mess, made transparent</p>
                </div>

                {/* Sign-in card */}
                <div className="glass-card-solid p-8">
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Sign in with your Google account to continue</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-4">
                                <div className="w-8 h-8 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google Sign-In failed')}
                                    theme="outline"
                                    size="large"
                                    width="320"
                                    text="signin_with"
                                    shape="rectangular"
                                />
                            </div>
                        )}

                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                            New users are automatically registered as students.<br />
                            Protected by reCAPTCHA.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
