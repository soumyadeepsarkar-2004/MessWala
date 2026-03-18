import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineIdentification,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineCheck,
} from 'react-icons/hi';

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    collegeId: '',
    roomNumber: '',
    phone: '',
    address: '',
    dob: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.collegeId || !form.roomNumber || !form.phone) {
      return toast.error('College ID, Room Number, and Phone are required');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/student/complete-profile', form);
      updateUser(res.data.user);
      toast.success('Profile completed! Awaiting manager approval.');
      navigate('/pending');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'collegeId',
      label: 'College ID Number',
      icon: HiOutlineIdentification,
      type: 'text',
      placeholder: 'e.g. CSE2024001',
      required: true,
    },
    {
      name: 'roomNumber',
      label: 'Room Number',
      icon: HiOutlineHome,
      type: 'text',
      placeholder: 'e.g. A-204',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      icon: HiOutlinePhone,
      type: 'tel',
      placeholder: '+91 98765 43210',
      required: true,
    },
    {
      name: 'address',
      label: 'Address',
      icon: HiOutlineLocationMarker,
      type: 'text',
      placeholder: 'Your home address',
    },
    { name: 'dob', label: 'Date of Birth', icon: HiOutlineCalendar, type: 'date', placeholder: '' },
  ];

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl' />
      </div>

      <div className='w-full max-w-lg relative animate-fade-in'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 mb-4'>
            <HiOutlineIdentification className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Complete Your Profile
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            Hi <span className='font-semibold text-primary-500'>{user?.name}</span>, fill in your
            college details to continue
          </p>
        </div>

        <div className='glass-card-solid p-8'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {fields.map(({ name, label, icon: Icon, type, placeholder, required }) => (
              <div key={name}>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  {label} {required && <span className='text-red-500'>*</span>}
                </label>
                <div className='relative'>
                  <Icon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className='input-field pl-10'
                    placeholder={placeholder}
                    required={required}
                  />
                </div>
              </div>
            ))}

            <div className='pt-2'>
              <button
                type='submit'
                disabled={loading}
                className='btn-primary w-full flex items-center justify-center gap-2'
              >
                {loading ? (
                  <div className='w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                ) : (
                  <>
                    <HiOutlineCheck className='w-5 h-5' />
                    Submit & Continue
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className='text-xs text-center text-gray-400 dark:text-gray-500 mt-4'>
          Your profile will be reviewed by the mess manager before activation.
        </p>
      </div>
    </div>
  );
}
