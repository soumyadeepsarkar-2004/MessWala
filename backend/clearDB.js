const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const User = require('./src/models/User');
const MealAttendance = require('./src/models/MealAttendance');
const Expense = require('./src/models/Expense');
const Menu = require('./src/models/Menu');
const Feedback = require('./src/models/Feedback');
const Task = require('./src/models/Task');
const MessConfig = require('./src/models/MessConfig');

async function cleanDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    await MealAttendance.deleteMany({});
    await Expense.deleteMany({});
    await Menu.deleteMany({});
    await Feedback.deleteMany({});
    await Task.deleteMany({});

    // reset setup flag
    await MessConfig.deleteMany({});

    // Delete all users except Admin
    await User.deleteMany({ email: { $ne: 'admin@messwala.com' } });

    console.log('🧹 Cleared all dummy data from production database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing DB:', err);
    process.exit(1);
  }
}

cleanDB();
