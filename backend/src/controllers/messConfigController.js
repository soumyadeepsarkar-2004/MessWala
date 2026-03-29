const MessConfig = require('../models/MessConfig');
const Hostel = require('../models/Hostel');
const { getLogger } = require('../utils/logger');

const logger = getLogger('MessConfig');

/**
 * @desc    Get MessConfig for user's hostel
 * @route   GET /api/config
 * @access  Protected
 */
exports.getConfig = async (req, res) => {
  try {
    // Get user's hostel (if they're a manager/admin)
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to access configuration',
      });
    }

    const config = await MessConfig.findOne({ hostel: hostel._id }).populate(
      'hostel setBy setupCompletedBy',
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found. Please setup first.',
      });
    }

    res.json({
      success: true,
      config,
      hostel: {
        id: hostel._id,
        name: hostel.name,
        code: hostel.code,
      },
    });
  } catch (err) {
    logger.error('Get config error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Initialize MessConfig for new hostel
 * @route   POST /api/config/setup
 * @access  Protected (hostel admin only)
 */
exports.setupConfig = async (req, res) => {
  try {
    const { messName, messDescription, messEmail, messPhone, mealTimes, expenseCategories } =
      req.body;

    // Validate required fields
    if (!messName || !messName.trim()) {
      return res.status(400).json({ success: false, error: 'Mess name is required' });
    }

    if (!mealTimes || mealTimes.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one meal time is required' });
    }

    if (!expenseCategories || expenseCategories.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'At least one expense category is required' });
    }

    // Verify user is hostel admin
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to setup configuration',
      });
    }

    // Check if config already exists
    let config = await MessConfig.findOne({ hostel: hostel._id });

    if (config && config.isSetup) {
      return res.status(400).json({
        success: false,
        error: 'Configuration already exists. Use update endpoint to modify.',
      });
    }

    // Prepare config data
    const processedMealTimes = mealTimes.map((meal) => ({
      _id: undefined,
      type: meal.type.trim(),
      emoji: meal.emoji,
      label: meal.label.trim(),
      startTime: meal.startTime,
      endTime: meal.endTime,
      color: meal.color,
      isActive: meal.isActive !== false,
    }));

    const processedCategories = expenseCategories.map((cat) => ({
      _id: undefined,
      value: cat.value.trim(),
      label: cat.label.trim(),
      emoji: cat.emoji,
      color: cat.color,
      isActive: cat.isActive !== false,
    }));

    // Create or update config
    if (!config) {
      config = new MessConfig({
        hostel: hostel._id,
      });
    }

    config.messName = messName.trim();
    config.messDescription = (messDescription || '').trim();
    config.messEmail = (messEmail || '').trim().toLowerCase();
    config.messPhone = (messPhone || '').trim();
    config.mealTimes = processedMealTimes;
    config.expenseCategories = processedCategories;
    config.menuDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    config.isSetup = true;
    config.setupCompletedAt = new Date();
    config.setupCompletedBy = req.user.id;
    config.setupVersion = (config.setupVersion || 0) + 1;

    await config.save();

    logger.info('Config setup completed', {
      hostelId: hostel._id,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Configuration setup completed successfully',
      config,
    });
  } catch (err) {
    logger.error('Setup config error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Update MessConfig (manager/admin only)
 * @route   PUT /api/config
 * @access  Protected (hostel admin only)
 */
exports.updateConfig = async (req, res) => {
  try {
    const { messName, messDescription, messEmail, messPhone, mealTimes, expenseCategories } =
      req.body;

    // Verify user is hostel admin
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update configuration',
      });
    }

    const config = await MessConfig.findOne({ hostel: hostel._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found',
      });
    }

    // Update fields
    if (messName && messName.trim()) {
      config.messName = messName.trim();
    }
    if (messDescription !== undefined) {
      config.messDescription = (messDescription || '').trim();
    }
    if (messEmail !== undefined) {
      config.messEmail = (messEmail || '').trim().toLowerCase();
    }
    if (messPhone !== undefined) {
      config.messPhone = (messPhone || '').trim();
    }

    // Update meal times if provided
    if (mealTimes && Array.isArray(mealTimes)) {
      config.mealTimes = mealTimes.map((meal) => ({
        _id: meal._id || undefined,
        type: meal.type.trim(),
        emoji: meal.emoji,
        label: meal.label.trim(),
        startTime: meal.startTime,
        endTime: meal.endTime,
        color: meal.color,
        isActive: meal.isActive !== false,
      }));
    }

    // Update expense categories if provided
    if (expenseCategories && Array.isArray(expenseCategories)) {
      config.expenseCategories = expenseCategories.map((cat) => ({
        _id: cat._id || undefined,
        value: cat.value.trim(),
        label: cat.label.trim(),
        emoji: cat.emoji,
        color: cat.color,
        isActive: cat.isActive !== false,
      }));
    }

    config.setupVersion = (config.setupVersion || 0) + 1;
    await config.save();

    logger.info('Config updated', {
      hostelId: hostel._id,
      userId: req.user.id,
      version: config.setupVersion,
    });

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config,
    });
  } catch (err) {
    logger.error('Update config error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Add new meal time
 * @route   POST /api/config/meal-times
 * @access  Protected (hostel admin only)
 */
exports.addMealTime = async (req, res) => {
  try {
    const { type, emoji, label, startTime, endTime, color } = req.body;

    // Validate
    if (!type || !label || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Type, label, startTime, and endTime are required',
      });
    }

    // Verify user is hostel admin
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized',
      });
    }

    const config = await MessConfig.findOne({ hostel: hostel._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found',
      });
    }

    // Check if meal type already exists
    if (config.mealTimes.some((m) => m.type === type.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Meal type already exists',
      });
    }

    config.mealTimes.push({
      type: type.trim(),
      emoji: emoji || '🍽️',
      label: label.trim(),
      startTime,
      endTime,
      color: color || 'from-amber-400 to-orange-500',
      isActive: true,
    });

    await config.save();

    res.json({
      success: true,
      message: 'Meal time added',
      config,
    });
  } catch (err) {
    logger.error('Add meal time error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Add new expense category
 * @route   POST /api/config/expense-categories
 * @access  Protected (hostel admin only)
 */
exports.addExpenseCategory = async (req, res) => {
  try {
    const { value, label, emoji, color } = req.body;

    // Validate
    if (!value || !label) {
      return res.status(400).json({
        success: false,
        error: 'Value and label are required',
      });
    }

    // Verify user is hostel admin
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized',
      });
    }

    const config = await MessConfig.findOne({ hostel: hostel._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found',
      });
    }

    // Check if category already exists
    if (config.expenseCategories.some((c) => c.value === value.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Category already exists',
      });
    }

    config.expenseCategories.push({
      value: value.trim(),
      label: label.trim(),
      emoji: emoji || '📦',
      color: color || 'bg-gray-100',
      isActive: true,
    });

    await config.save();

    res.json({
      success: true,
      message: 'Expense category added',
      config,
    });
  } catch (err) {
    logger.error('Add expense category error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Verify configuration is complete
 * @route   GET /api/config/status
 * @access  Protected
 */
exports.getConfigStatus = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({
      $or: [{ admin: req.user.id }, { coAdmins: req.user.id }],
    });

    if (!hostel) {
      return res.json({
        success: true,
        isConfigured: false,
        message: 'User is not a hostel manager',
      });
    }

    const config = await MessConfig.findOne({ hostel: hostel._id });

    res.json({
      success: true,
      isConfigured: config && config.isSetup,
      config: config || null,
    });
  } catch (err) {
    logger.error('Get config status error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
