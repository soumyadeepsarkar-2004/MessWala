const jwt = require('jsonwebtoken');
// bcryptjs is used via bcryptjs.compare in password validation context
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../utils/email');
const { validateEmail, validatePhone } = require('../utils/validation');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

async function verifyCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return true;
  }
  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  );
  const data = await res.json();
  return data.success && data.score >= 0.5;
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    roomNumber: user.roomNumber,
    phone: user.phone,
    address: user.address,
    dob: user.dob,
    messNumber: user.messNumber,
    isApproved: user.isApproved,
    profileComplete: user.profileComplete,
    avatar: user.avatar,
  };
}

// ─── ADMIN / MANAGER LOGIN (email + password) ───
// POST /api/auth/admin/login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!['admin', 'manager', 'treasurer'].includes(user.role)) {
      return res
        .status(403)
        .json({ success: false, error: 'This login is for admin/manager accounts only' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GOOGLE SIGN-IN (students) ───
// POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential, captchaToken } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential is required' });
    }

    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
      return res
        .status(403)
        .json({ success: false, error: 'CAPTCHA verification failed. Please try again.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    let isNew = false;

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture) {
          user.avatar = picture;
        }
        await user.save();
      }
    } else {
      isNew = true;
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || '',
        role: 'student',
        isApproved: false,
        profileComplete: false,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: userResponse(user),
      isNew,
    });
  } catch (err) {
    if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
      return res
        .status(401)
        .json({ success: false, error: 'Google sign-in expired. Please try again.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── COMPLETE STUDENT PROFILE (after Google sign-in) ───
// POST /api/auth/student/complete-profile
exports.completeProfile = async (req, res) => {
  try {
    const { collegeId, roomNumber, phone, address, dob } = req.body;

    if (!collegeId || !roomNumber || !phone) {
      return res
        .status(400)
        .json({ success: false, error: 'College ID, Room Number, and Phone are required' });
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    // Validate collegeId and roomNumber are non-empty strings
    if (typeof collegeId !== 'string' || collegeId.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'College ID must be a non-empty string' });
    }
    if (typeof roomNumber !== 'string' || roomNumber.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Room Number must be a non-empty string' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.collegeId = collegeId.trim();
    user.roomNumber = roomNumber.trim();
    user.phone = phone;
    if (address) {
      user.address = address.trim();
    }
    if (dob) {
      user.dob = dob;
    }
    user.profileComplete = true;
    await user.save();

    res.json({ success: true, user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── FORGOT PASSWORD (send OTP) ───
// POST /api/auth/admin/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ success: true, message: 'If the email exists, an OTP has been sent' });
    }

    if (!['admin', 'manager', 'treasurer'].includes(user.role)) {
      return res.json({ success: true, message: 'If the email exists, an OTP has been sent' });
    }

    const { otp, otpExpiry } = generateOTP();
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, otp, user.name);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send OTP. Please try again.' });
  }
};

// ─── VERIFY OTP ───
// POST /api/auth/admin/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user || !user.otp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    if (user.otpExpiry < new Date()) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(400)
        .json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // OTP valid — generate a short-lived reset token
    const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── RESET PASSWORD ───
// POST /api/auth/admin/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: 'Password must be at least 6 characters' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, error: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── APPROVE STUDENT & ASSIGN MESS ───
// PUT /api/auth/admin/approve-student/:id
exports.approveStudent = async (req, res) => {
  try {
    const { messNumber } = req.body;
    if (!messNumber) {
      return res.status(400).json({ success: false, error: 'Mess number is required' });
    }

    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ success: false, error: 'Can only approve student accounts' });
    }

    student.isApproved = true;
    student.messNumber = messNumber;
    await student.save();

    res.json({ success: true, user: userResponse(student) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── REJECT / REMOVE STUDENT ───
// DELETE /api/auth/admin/reject-student/:id
exports.rejectStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ success: false, error: 'Can only reject student accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student registration rejected' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET PENDING STUDENTS ───
// GET /api/auth/admin/pending-students
exports.getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      isApproved: false,
      profileComplete: true,
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students: students.map(userResponse) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET ALL APPROVED STUDENTS ───
// GET /api/auth/admin/approved-students
exports.getApprovedStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isApproved: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students: students.map(userResponse) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET PROFILE ───
// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET ALL USERS (admin) ───
// GET /api/auth/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users: users.map(userResponse) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── ADMIN SETUP (first-time onboarding) ───
// POST /api/auth/admin/setup
const MessConfig = require('../models/MessConfig');

exports.adminSetup = async (req, res) => {
  try {
    // Only allow admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can configure the mess' });
    }

    // Check if setup already exists
    let config = await MessConfig.findOne();
    if (config && config.isSetup) {
      return res.status(400).json({
        success: false,
        error: 'Mess is already configured. Contact admin if changes needed.',
      });
    }

    const {
      messName,
      messDescription,
      messEmail,
      messPhone,
      expenseCategories,
      mealTimes,
      menuDays,
    } = req.body;

    if (
      !messName ||
      !expenseCategories ||
      !expenseCategories.length ||
      !mealTimes ||
      !mealTimes.length
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'Mess name, categories, and meal times are required' });
    }

    if (!config) {
      config = new MessConfig();
    }

    config.messName = messName;
    config.messDescription = messDescription || '';
    config.messEmail = messEmail || '';
    config.messPhone = messPhone || '';
    config.expenseCategories = expenseCategories;
    config.mealTimes = mealTimes;
    config.menuDays = menuDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    config.isSetup = true;
    config.setupCompletedAt = new Date();
    config.setupCompletedBy = req.user.id;

    await config.save();

    res.json({ success: true, message: 'Mess configuration saved successfully', config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET MESS CONFIG ───
// GET /api/auth/admin/config
exports.getMessConfig = async (req, res) => {
  try {
    let config = await MessConfig.findOne();

    if (!config) {
      config = new MessConfig();
    }

    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
