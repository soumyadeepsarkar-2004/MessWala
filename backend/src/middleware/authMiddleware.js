const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized - no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized - invalid token' });
    }
};

// Authorize by roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

// Require approved student (or admin/manager/treasurer pass through)
const requireApproval = (req, res, next) => {
    if (req.user.role === 'student' && !req.user.isApproved) {
        return res.status(403).json({
            success: false,
            error: 'Your account is pending approval by the manager',
            pendingApproval: true,
        });
    }
    next();
};

module.exports = { protect, authorize, requireApproval };
