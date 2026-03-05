const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// Verify reCAPTCHA v3 token
async function verifyCaptcha(token) {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) return true; // skip in dev if not configured
    const res = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    );
    const data = await res.json();
    return data.success && data.score >= 0.5;
}

// @desc    Google Sign-In (login or auto-register)
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
    try {
        const { credential, captchaToken } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, error: 'Google credential is required' });
        }

        // Verify reCAPTCHA
        const captchaValid = await verifyCaptcha(captchaToken);
        if (!captchaValid) {
            return res.status(403).json({ success: false, error: 'CAPTCHA verification failed. Please try again.' });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find existing user or create new one
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Link Google account if user exists by email but not yet linked
            if (!user.googleId) {
                user.googleId = googleId;
                if (picture) user.avatar = picture;
                await user.save();
            }
        } else {
            // Auto-register as student
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture || '',
                role: 'student',
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roomNumber: user.roomNumber,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
            return res.status(401).json({ success: false, error: 'Google sign-in expired. Please try again.' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roomNumber: user.roomNumber,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
