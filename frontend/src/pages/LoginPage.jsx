import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import toast from 'react-hot-toast';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

export default function LoginPage() {
  const [tab, setTab] = useState('student'); // 'student' | 'admin'
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { googleLogin, adminLogin } = useAuth();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      let captchaToken = '';
      if (executeRecaptcha) {
        captchaToken = await executeRecaptcha('login');
      }
      const result = await googleLogin(credentialResponse.credential, captchaToken);

      if (!result.user.profileComplete) {
        toast.success('Welcome! Please complete your profile.');
        navigate('/onboarding');
      } else if (!result.user.isApproved) {
        toast('Your account is pending approval by the manager.', { icon: '⏳' });
        navigate('/pending');
      } else {
        toast.success('Welcome back! 🍛');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter email and password');
    }
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success('Welcome back! 🍛');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100/20 dark:bg-yellow-900/5 rounded-full blur-3xl' />
      </div>

      <div className='w-full max-w-md relative animate-fade-in'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30 mb-4'>
            <span className='text-3xl'>🍛</span>
          </div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Welcome to MessWala</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            Your hostel mess, made transparent
          </p>
        </div>

        {/* Tab switcher */}
        <div className='flex mb-6 bg-gray-100 dark:bg-dark-800 rounded-xl p-1'>
          <button
            onClick={() => setTab('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              tab === 'student'
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <HiOutlineAcademicCap className='w-4 h-4' />
            Student
          </button>
          <button
            onClick={() => setTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              tab === 'admin'
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <HiOutlineShieldCheck className='w-4 h-4' />
            Admin / Manager
          </button>
        </div>

        {/* Sign-in card */}
        <div className='glass-card-solid p-8'>
          {tab === 'student' ? (
            <div className='space-y-6'>
              <div className='text-center'>
                <h2 className='text-lg font-bold text-gray-900 dark:text-white mb-1'>
                  Student Sign In
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Use your Google account to sign in or register
                </p>
              </div>

              {loading ? (
                <div className='flex justify-center py-4'>
                  <div className='w-8 h-8 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin' />
                </div>
              ) : (
                <div className='flex justify-center'>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Sign-In failed')}
                    theme='outline'
                    size='large'
                    width='320'
                    text='signin_with'
                    shape='rectangular'
                  />
                </div>
              )}

              <p className='text-xs text-center text-gray-400 dark:text-gray-500'>
                New students will need to complete their profile after sign-in.
                <br />
                Your account will be activated after manager approval.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className='space-y-5'>
              <div className='text-center mb-2'>
                <h2 className='text-lg font-bold text-gray-900 dark:text-white mb-1'>
                  Admin / Manager Login
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Sign in with your admin credentials
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  Email
                </label>
                <div className='relative'>
                  <HiOutlineMail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='input-field pl-10'
                    placeholder='admin@messwala.com'
                    autoComplete='email'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  Password
                </label>
                <div className='relative'>
                  <HiOutlineLockClosed className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='input-field pl-10'
                    placeholder='••••••••'
                    autoComplete='current-password'
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='btn-primary w-full flex items-center justify-center gap-2'
              >
                {loading ? (
                  <div className='w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                ) : (
                  <>
                    <HiOutlineLockClosed className='w-4 h-4' />
                    Sign In
                  </>
                )}
              </button>

              <div className='text-center'>
                <Link
                  to='/forgot-password'
                  className='text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors'
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className='text-xs text-center text-gray-400 dark:text-gray-500 mt-4'>
          Protected by reCAPTCHA
        </p>
      </div>
    </div>
  );
}
