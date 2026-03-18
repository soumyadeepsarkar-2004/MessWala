const Expense = require('../models/Expense');
const MealAttendance = require('../models/MealAttendance');
const {
  validateDateString,
  validateMonthString,
  validateCategory,
} = require('../utils/validation');

// @desc    Add an expense
// @route   POST /api/expenses
exports.addExpense = async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;
    const expenseDate = date || new Date().toISOString().split('T')[0];

    const expense = await Expense.create({
      category,
      amount,
      date: expenseDate,
      description,
      addedBy: req.user.id,
    });

    res.status(201).json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get expenses with optional date filters
// @route   GET /api/expenses?start=YYYY-MM-DD&end=YYYY-MM-DD&category=vegetables
exports.getExpenses = async (req, res) => {
  try {
    const { start, end, category } = req.query;
    const filter = {};

    if (start && end) {
      const validatedStart = validateDateString(start);
      const validatedEnd = validateDateString(end);

      if (!validatedStart || !validatedEnd) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      filter.date = { $gte: validatedStart, $lte: validatedEnd };
    } else if (start) {
      const validatedStart = validateDateString(start);
      if (!validatedStart) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      filter.date = { $gte: validatedStart };
    }

    if (category) {
      const validatedCategory = validateCategory(category);
      if (validatedCategory) {
        filter.category = validatedCategory;
      }
    }

    const expenses = await Expense.find(filter).populate('addedBy', 'name').sort({ date: -1 });

    res.json({ success: true, count: expenses.length, expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get monthly summary (aggregated by category)
// @route   GET /api/expenses/summary?month=YYYY-MM
exports.getMonthlySummary = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    // Validate month format (YYYY-MM)
    const validatedMonth = validateMonthString(month);
    if (!validatedMonth) {
      return res.status(400).json({ success: false, error: 'Invalid month format. Use YYYY-MM' });
    }

    // Use exact prefix match instead of regex to prevent injection
    const summary = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: validatedMonth + '-01',
            $lt: validatedMonth + '-32', // This will naturally exclude dates beyond valid month
          },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalExpense = summary.reduce((acc, s) => acc + s.total, 0);

    res.json({ success: true, month: validatedMonth, totalExpense, breakdown: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get cost per plate
// @route   GET /api/expenses/cost-per-plate?month=YYYY-MM
exports.getCostPerPlate = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    // Validate month format (YYYY-MM)
    const validatedMonth = validateMonthString(month);
    if (!validatedMonth) {
      return res.status(400).json({ success: false, error: 'Invalid month format. Use YYYY-MM' });
    }

    // Total expenses for the month (use string comparison instead of regex)
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: validatedMonth + '-01',
            $lt: validatedMonth + '-32',
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

    // Total meals served (present = true)
    const mealsServed = await MealAttendance.countDocuments({
      date: {
        $gte: validatedMonth + '-01',
        $lt: validatedMonth + '-32',
      },
      present: true,
    });

    const costPerPlate = mealsServed > 0 ? (totalExpense / mealsServed).toFixed(2) : 0;

    res.json({
      success: true,
      month: validatedMonth,
      totalExpense,
      mealsServed,
      costPerPlate: Number(costPerPlate),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Export expenses as CSV
// @route   GET /api/expenses/export?month=YYYY-MM
exports.exportCSV = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    // Validate month format (YYYY-MM)
    const validatedMonth = validateMonthString(month);
    if (!validatedMonth) {
      return res.status(400).json({ success: false, error: 'Invalid month format. Use YYYY-MM' });
    }

    const expenses = await Expense.find({
      date: {
        $gte: validatedMonth + '-01',
        $lt: validatedMonth + '-32',
      },
    })
      .populate('addedBy', 'name')
      .sort({ date: 1 });

    const csvRows = [
      'Date,Category,Amount,Description,Added By',
      ...expenses.map(
        (e) =>
          `${e.date},${e.category},${e.amount},"${e.description || ''}",${
            e.addedBy?.name || 'Unknown'
          }`,
      ),
    ];

    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
    csvRows.push(`\nTotal,,${totalExpense},,`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses_${validatedMonth}.csv`);
    res.send(csvRows.join('\n'));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
