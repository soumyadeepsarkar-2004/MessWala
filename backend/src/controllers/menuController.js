const Menu = require('../models/Menu');
const { validateDateString } = require('../utils/validation');

// @desc    Set menu for a date
// @route   POST /api/menu
exports.setMenu = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Validate that at least one meal is provided
    if (!breakfast && !lunch && !dinner) {
      return res.status(400).json({ success: false, error: 'At least one meal must be provided' });
    }

    // Validate meal values (should be non-empty strings if provided)
    if (breakfast && (typeof breakfast !== 'string' || breakfast.trim().length === 0)) {
      return res.status(400).json({ success: false, error: 'Breakfast must be a non-empty string' });
    }
    if (lunch && (typeof lunch !== 'string' || lunch.trim().length === 0)) {
      return res.status(400).json({ success: false, error: 'Lunch must be a non-empty string' });
    }
    if (dinner && (typeof dinner !== 'string' || dinner.trim().length === 0)) {
      return res.status(400).json({ success: false, error: 'Dinner must be a non-empty string' });
    }

    // Validate date input - reject invalid dates
    let menuDate = today;
    if (date) {
      const validatedDate = validateDateString(date);
      if (validatedDate) {
        menuDate = validatedDate;
      } else {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
      }
    }

    const menu = await Menu.findOneAndUpdate(
      { date: menuDate },
      {
        breakfast: breakfast ? breakfast.trim() : null,
        lunch: lunch ? lunch.trim() : null,
        dinner: dinner ? dinner.trim() : null,
        setBy: req.user.id,
      },
      { upsert: true, new: true, runValidators: true },
    );

    res.json({ success: true, menu });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get today's menu
// @route   GET /api/menu/today
exports.getTodayMenu = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const menu = await Menu.findOne({ date: today });

    if (!menu) {
      return res.json({
        success: true,
        menu: { date: today, breakfast: 'Not set', lunch: 'Not set', dinner: 'Not set' },
      });
    }

    res.json({ success: true, menu });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get menu for a date range
// @route   GET /api/menu?start=YYYY-MM-DD&end=YYYY-MM-DD
exports.getMenu = async (req, res) => {
  try {
    const { start, end } = req.query;

    const filter = {};
    if (start && end) {
      // Validate both dates - return error if invalid
      const validatedStart = validateDateString(start);
      const validatedEnd = validateDateString(end);

      if (!validatedStart || !validatedEnd) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
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

    const menus = await Menu.find(filter).sort({ date: 1 });
    res.json({ success: true, count: menus.length, menus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
