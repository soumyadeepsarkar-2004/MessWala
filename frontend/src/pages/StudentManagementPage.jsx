import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineUserGroup, HiOutlineCheck, HiOutlineX, HiOutlineMail,
    HiOutlinePhone, HiOutlineIdentification, HiOutlineHome,
    HiOutlineSearch, HiOutlineRefresh
} from 'react-icons/hi';

export default function StudentManagementPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('pending'); // 'pending' | 'approved'
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [messInput, setMessInput] = useState({});

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const endpoint = tab === 'pending' ? '/auth/admin/pending-students' : '/auth/admin/approved-students';
            const res = await api.get(endpoint);
            setStudents(res.data.students);
        } catch (err) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [tab]);

    const handleApprove = async (studentId) => {
        const mess = messInput[studentId];
        if (!mess) {
            return toast.error('Please enter a mess number');
        }
        try {
            await api.put(`/auth/admin/approve-student/${studentId}`, { messNumber: mess });
            toast.success('Student approved successfully!');
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to approve student');
        }
    };

    const handleReject = async (studentId) => {
        if (!window.confirm('Are you sure you want to reject this student? This will delete their account.')) return;
        try {
            await api.delete(`/auth/admin/reject-student/${studentId}`);
            toast.success('Student registration rejected');
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reject student');
        }
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.collegeId && s.collegeId.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="page-container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="section-title mb-0">Student Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Approve new students and assign mess numbers</p>
                </div>
                <button onClick={fetchStudents} className="btn-secondary inline-flex items-center gap-2 self-start">
                    <HiOutlineRefresh className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab('pending')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                        }`}
                >
                    <HiOutlineUserGroup className="w-4 h-4" />
                    Pending
                </button>
                <button
                    onClick={() => setTab('approved')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                        }`}
                >
                    <HiOutlineCheck className="w-4 h-4" />
                    Approved
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Search by name, email, or college ID..."
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-solid p-12 text-center">
                    <HiOutlineUserGroup className="w-12 h-12 text-gray-300 dark:text-dark-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        {tab === 'pending' ? 'No pending student registrations' : 'No approved students found'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((student) => (
                        <div key={student.id} className="glass-card-solid p-5 animate-fade-in">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {student.avatar ? (
                                        <img src={student.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                                                {student.name?.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{student.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                                    </div>
                                </div>
                                {tab === 'approved' && student.messNumber && (
                                    <span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                        Mess #{student.messNumber}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                {student.collegeId && (
                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                        <HiOutlineIdentification className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{student.collegeId}</span>
                                    </div>
                                )}
                                {student.roomNumber && (
                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                        <HiOutlineHome className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>Room {student.roomNumber}</span>
                                    </div>
                                )}
                                {student.phone && (
                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                        <HiOutlinePhone className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{student.phone}</span>
                                    </div>
                                )}
                                {student.email && (
                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                        <HiOutlineMail className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{student.email}</span>
                                    </div>
                                )}
                            </div>

                            {tab === 'pending' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={messInput[student.id] || ''}
                                        onChange={(e) => setMessInput({ ...messInput, [student.id]: e.target.value })}
                                        className="input-field text-sm py-2 flex-1"
                                        placeholder="Mess No."
                                    />
                                    <button
                                        onClick={() => handleApprove(student.id)}
                                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                        title="Approve"
                                    >
                                        <HiOutlineCheck className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleReject(student.id)}
                                        className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        title="Reject"
                                    >
                                        <HiOutlineX className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
