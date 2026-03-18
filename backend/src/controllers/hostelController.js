/**
 * Multi-Hostel Management Controller
 * Handles hostel creation, configuration, and administration
 */

const Hostel = require('../models/Hostel');
const User = require('../models/User');
const { validatePositiveInteger } = require('../utils/validation');

/**
 * POST /api/hostels
 * Create a new hostel
 */
async function createHostel(req, res) {
  try {
    const { name, code, location, totalStudents } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Hostel name and code are required',
      });
    }

    // Check if code already exists
    const existing = await Hostel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Hostel code already exists',
      });
    }

    const hostel = new Hostel({
      name,
      code: code.toUpperCase(),
      location,
      totalStudents: validatePositiveInteger(totalStudents, 0),
      admin: req.user._id,
    });

    await hostel.save();

    // Update user with hostel association
    await User.findByIdAndUpdate(req.user._id, {
      $push: { hostels: hostel._id },
      hostel: hostel._id,
    });

    res.status(201).json({
      success: true,
      data: hostel,
      message: 'Hostel created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/hostels
 * Get all hostels (admin can see all, users see their own)
 */
async function getHostels(req, res) {
  try {
    const { role, _id } = req.user;

    let query = {};

    if (role !== 'admin') {
      query = {
        $or: [{ admin: _id }, { coAdmins: _id }],
      };
    }

    const hostels = await Hostel.find(query)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: hostels,
      count: hostels.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/hostels/:id
 * Get hostel details
 */
async function getHostelById(req, res) {
  try {
    const hostel = await Hostel.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('coAdmins', 'name email');

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found',
      });
    }

    res.json({
      success: true,
      data: hostel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /api/hostels/:id
 * Update hostel details
 */
async function updateHostel(req, res) {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found',
      });
    }

    // Check authorization
    if (hostel.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this hostel',
      });
    }

    // Update fields
    const updatable = ['name', 'description', 'location', 'settings'];
    updatable.forEach((field) => {
      if (req.body[field]) {
        hostel[field] = req.body[field];
      }
    });

    await hostel.save();

    res.json({
      success: true,
      data: hostel,
      message: 'Hostel updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/hostels/:id/add-co-admin
 * Add co-admin to hostel
 */
async function addCoAdmin(req, res) {
  try {
    const { userId } = req.body;

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found',
      });
    }

    // Check authorization
    if (hostel.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only hostel admin can add co-admins',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already co-admin
    if (hostel.coAdmins.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already a co-admin',
      });
    }

    hostel.coAdmins.push(userId);
    await hostel.save();

    res.json({
      success: true,
      data: hostel,
      message: 'Co-admin added successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/hostels/:id/stats
 * Get hostel statistics
 */
async function getHostelStats(req, res) {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found',
      });
    }

    // Check authorization
    if (
      hostel.admin.toString() !== req.user._id.toString() &&
      !hostel.coAdmins.some((id) => id.toString() === req.user._id.toString()) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Get member count
    const memberCount = await User.countDocuments({ hostel: req.params.id });

    res.json({
      success: true,
      data: {
        ...hostel.stats.toObject(),
        currentMembers: memberCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * DELETE /api/hostels/:id
 * Delete hostel (admin only)
 */
async function deleteHostel(req, res) {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found',
      });
    }

    // Only admin or hostel owner can delete
    if (hostel.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this hostel',
      });
    }

    await Hostel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Hostel deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  addCoAdmin,
  getHostelStats,
  deleteHostel,
};
