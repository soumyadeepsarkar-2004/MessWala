const Menu = require('../models/Menu');
const MessConfig = require('../models/MessConfig');
const Hostel = require('../models/Hostel');
const { validateDateString } = require('../utils/validation');
const { getLogger } = require('../utils/logger');

const logger = getLogger('MenuController');

/**
 * @desc    Set/Update menu for a date
 * @route   POST /api/menu
 * @access  Protected (manager/admin only)
 */
exports.setMenu = async (req, res) => {
  try {
    const { date, meals } = req.body;

    // Verify user is hostel admin/manager
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'Only hostel managers can set menus',
      });
    }

    // Get hostel config to validate meal types
    const config = await MessConfig.findOne({ hostel: hostel._id });
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Hostel configuration not found. Please setup configuration first.',
      });
    }

    // Validate that at least one meal is provided with content
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one meal must be provided',
      });
    }

    // Validate each meal
    const validMealTypes = config.mealTimes.map((m) => m.type);
    const processedMeals = [];

    for (const meal of meals) {
      if (!meal.type || !meal.content) {
        return res.status(400).json({
          success: false,
          error: 'Each meal must have type and content',
        });
      }

      if (!validMealTypes.includes(meal.type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid meal type: ${meal.type}. Must be one of: ${validMealTypes.join(', ')}`,
        });
      }

      if (typeof meal.content !== 'string' || meal.content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: `Content for ${meal.type} must be a non-empty string`,
        });
      }

      processedMeals.push({
        type: meal.type.trim(),
        content: meal.content.trim(),
        notes: (meal.notes || '').trim(),
        allergy_warnings: (meal.allergy_warnings || '').trim(),
      });
    }

    // Validate and process date
    let menuDate = new Date().toISOString().split('T')[0];
    if (date) {
      const validatedDate = validateDateString(date);
      if (!validatedDate) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD',
        });
      }
      menuDate = validatedDate;
    }

    // Create or update menu
    const menu = await Menu.findOneAndUpdate(
      { hostel: hostel._id, date: menuDate },
      {
        meals: processedMeals,
        setBy: req.user.id,
        status: 'published',
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    ).populate('setBy', 'name email');

    logger.info('Menu set successfully', {
      hostelId: hostel._id,
      date: menuDate,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Menu updated successfully',
      menu,
    });
  } catch (err) {
    logger.error('Set menu error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get today's menu
 * @route   GET /api/menu/today
 * @access  Protected
 */
exports.getTodayMenu = async (req, res) => {
  try {
    // Get user's hostel
    const hostel = await Hostel.findOne({
      $or: [
        { admin: req.user.id },
        { coAdmins: req.user.id },
        { _id: req.query.hostelId }, // Allow specifying hostel
      ],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this hostel',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const menu = await Menu.findOne({
      hostel: hostel._id,
      date: today,
      status: { $ne: 'archived' },
    }).populate('setBy', 'name email');

    if (!menu) {
      // Return empty menu structure with configured meal types
      const config = await MessConfig.findOne({ hostel: hostel._id });
      const mealTypes = config ? config.mealTimes.filter((m) => m.isActive) : [];

      return res.json({
        success: true,
        menu: {
          date: today,
          hostel: hostel._id,
          meals: mealTypes.map((m) => ({
            type: m.type,
            content: 'Not set',
            notes: '',
          })),
          status: 'not_set',
        },
      });
    }

    res.json({ success: true, menu });
  } catch (err) {
    logger.error('Get today menu error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get menu for a date range
 * @route   GET /api/menu
 * @access  Protected
 * Query params: start (optional), end (optional)
 */
exports.getMenu = async (req, res) => {
  try {
    const { start, end } = req.query;

    // Get user's hostel
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to hostel menus',
      });
    }

    const filter = { hostel: hostel._id, status: { $ne: 'archived' } };

    if (start && end) {
      const validatedStart = validateDateString(start);
      const validatedEnd = validateDateString(end);

      if (!validatedStart || !validatedEnd) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      filter.date = { $gte: validatedStart, $lte: validatedEnd };
    } else {
      // Default: current week
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      filter.date = {
        $gte: monday.toISOString().split('T')[0],
        $lte: sunday.toISOString().split('T')[0],
      };
    }

    const menus = await Menu.find(filter).sort({ date: 1 }).populate('setBy', 'name email');

    res.json({
      success: true,
      count: menus.length,
      menus,
    });
  } catch (err) {
    logger.error('Get menu error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Delete/Archive a menu
 * @route   DELETE /api/menu/:date
 * @access  Protected (manager/admin only)
 */
exports.deleteMenu = async (req, res) => {
  try {
    const { date } = req.params;

    // Verify user is hostel admin
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'Only hostel managers can delete menus',
      });
    }

    const menu = await Menu.findOneAndUpdate(
      { hostel: hostel._id, date },
      { status: 'archived' },
      { new: true },
    );

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: 'Menu not found',
      });
    }

    logger.info('Menu archived', {
      hostelId: hostel._id,
      date,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Menu archived successfully',
    });
  } catch (err) {
    logger.error('Delete menu error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
