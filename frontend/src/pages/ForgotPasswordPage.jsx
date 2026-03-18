import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineMail,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineArrowLeft,
} from 'react-icons/hi';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/admin/forgot-password', { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/verify-otp', { email, otp });
      setResetToken(res.data.resetToken);
      toast.success('OTP verified! Set your new password.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return toast.error('Please fill in both fields');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/admin/reset-password', { resetToken, newPassword });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className='flex items-center justify-center gap-2 mb-6'>
      {[1, 2, 3].map((s) => (
        <div key={s} className='flex items-center gap-2'>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-gray-200 dark:bg-dark-700 text-gray-400'
            }`}
          >
            {s}
          </div>
          {s < 3 && (
            <div
              className={`w-8 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-700'}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl' />
      </div>

      <div className='w-full max-w-md relative animate-fade-in'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30 mb-4'>
            <HiOutlineKey className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Reset Password</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            {step === 1 && 'Enter your admin email to receive an OTP'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Set your new password'}
          </p>
        </div>

        {stepIndicator}

        <div className='glass-card-solid p-8'>
          {step === 1 && (
            <form onSubmit={handleSendOTP} className='space-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  Email Address
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
                    required
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
                  'Send OTP'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className='space-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  Enter OTP
                </label>
                <div className='relative'>
                  <HiOutlineKey className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className='input-field pl-10 text-center text-2xl tracking-[0.5em] font-bold'
                    placeholder='000000'
                    maxLength={6}
                    inputMode='numeric'
                    autoComplete='one-time-code'
                    required
                  />
                </div>
                <p className='text-xs text-gray-400 mt-2'>Check your email for the 6-digit OTP</p>
              </div>
              <button
                type='submit'
                disabled={loading}
                className='btn-primary w-full flex items-center justify-center gap-2'
              >
                {loading ? (
                  <div className='w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                ) : (
                  'Verify OTP'
                )}
              </button>
              <button
                type='button'
                onClick={() => {
                  setStep(1);
                  setOtp('');
                }}
                className='w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
              >
                Didn't receive it? Go back & try again
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className='space-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  New Password
                </label>
                <div className='relative'>
                  <HiOutlineLockClosed className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='input-field pl-10'
                    placeholder='Min 6 characters'
                    autoComplete='new-password'
                    required
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <HiOutlineLockClosed className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='input-field pl-10'
                    placeholder='Confirm new password'
                    autoComplete='new-password'
                    required
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
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>

        <div className='text-center mt-4'>
          <Link
            to='/login'
            className='inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium transition-colors'
          >
            <HiOutlineArrowLeft className='w-4 h-4' />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
