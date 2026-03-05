const express = require('express');
const router = express.Router();
const {
    adminLogin,
    googleAuth,
    completeProfile,
    forgotPassword,
    verifyOTP,
    resetPassword,
    approveStudent,
    rejectStudent,
    getPendingStudents,
    getApprovedStudents,
    getProfile,
    getUsers,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/admin/login', adminLogin);
router.post('/google', googleAuth);
router.post('/admin/forgot-password', forgotPassword);
router.post('/admin/verify-otp', verifyOTP);
router.post('/admin/reset-password', resetPassword);

// Protected routes
router.post('/student/complete-profile', protect, completeProfile);
router.get('/profile', protect, getProfile);

// Admin / Manager routes
router.get('/admin/pending-students', protect, authorize('admin', 'manager'), getPendingStudents);
router.get('/admin/approved-students', protect, authorize('admin', 'manager'), getApprovedStudents);
router.put('/admin/approve-student/:id', protect, authorize('admin', 'manager'), approveStudent);
router.delete('/admin/reject-student/:id', protect, authorize('admin', 'manager'), rejectStudent);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
