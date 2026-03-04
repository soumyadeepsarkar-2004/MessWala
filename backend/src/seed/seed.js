const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');
const Expense = require('../models/Expense');
const Menu = require('../models/Menu');
const Feedback = require('../models/Feedback');

const CATEGORIES = ['vegetables', 'rice', 'gas', 'salary', 'dairy', 'spices', 'misc'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const BREAKFAST_ITEMS = [
    'Poha & Chai', 'Aloo Paratha & Curd', 'Idli Sambar', 'Bread Butter & Omelette',
    'Upma & Chutney', 'Puri Bhaji', 'Dosa & Chutney', 'Cornflakes & Milk',
];
const LUNCH_ITEMS = [
    'Dal Rice & Sabzi', 'Rajma Rice', 'Chole Roti', 'Paneer Roti Dal',
    'Kadhi Chawal', 'Fish Curry Rice', 'Chicken Curry Rice', 'Veg Biryani',
];
const DINNER_ITEMS = [
    'Roti Sabzi Dal', 'Egg Curry Rice', 'Paneer Tikka Roti', 'Dal Fry Jeera Rice',
    'Mixed Veg Roti', 'Chicken Biryani', 'Aloo Gobi Roti', 'Mushroom Curry Rice',
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            MealAttendance.deleteMany({}),
            Expense.deleteMany({}),
            Menu.deleteMany({}),
            Feedback.deleteMany({}),
        ]);
        console.log('🧹 Cleared existing data');

        // Create users
        const users = await User.create([
            { name: 'Admin User', email: 'admin@messwala.com', password: 'admin123', role: 'admin', roomNumber: 'A-101' },
            { name: 'Mess Manager', email: 'manager@messwala.com', password: 'manager123', role: 'manager', roomNumber: 'A-102' },
            { name: 'Treasurer', email: 'treasurer@messwala.com', password: 'treasurer123', role: 'treasurer', roomNumber: 'A-103' },
            { name: 'Arjun Sharma', email: 'arjun@messwala.com', password: 'student123', role: 'student', roomNumber: 'B-201' },
            { name: 'Priya Patel', email: 'priya@messwala.com', password: 'student123', role: 'student', roomNumber: 'B-202' },
            { name: 'Rahul Kumar', email: 'rahul@messwala.com', password: 'student123', role: 'student', roomNumber: 'B-203' },
            { name: 'Sneha Gupta', email: 'sneha@messwala.com', password: 'student123', role: 'student', roomNumber: 'C-301' },
            { name: 'Vikram Singh', email: 'vikram@messwala.com', password: 'student123', role: 'student', roomNumber: 'C-302' },
            { name: 'Ananya Das', email: 'ananya@messwala.com', password: 'student123', role: 'student', roomNumber: 'C-303' },
            { name: 'Rohan Mehta', email: 'rohan@messwala.com', password: 'student123', role: 'student', roomNumber: 'D-401' },
        ]);
        console.log(`👥 Created ${users.length} users`);

        const students = users.filter((u) => u.role === 'student');
        const treasurer = users.find((u) => u.role === 'treasurer');

        // Generate 60 days of data
        const attendanceRecords = [];
        const expenseRecords = [];
        const menuRecords = [];
        const feedbackRecords = [];

        for (let dayOffset = 59; dayOffset >= 0; dayOffset--) {
            const d = new Date();
            d.setDate(d.getDate() - dayOffset);
            const dateStr = d.toISOString().split('T')[0];

            // Menu for this day
            menuRecords.push({
                date: dateStr,
                breakfast: randomItem(BREAKFAST_ITEMS),
                lunch: randomItem(LUNCH_ITEMS),
                dinner: randomItem(DINNER_ITEMS),
                setBy: users[1]._id, // manager
            });

            // Attendance for each student and each meal
            for (const student of students) {
                for (const mealType of MEAL_TYPES) {
                    const present = Math.random() > 0.15; // 85% attendance rate
                    attendanceRecords.push({
                        userId: student._id,
                        date: dateStr,
                        mealType,
                        present,
                    });

                    // Feedback (60% chance if present)
                    if (present && Math.random() > 0.4) {
                        feedbackRecords.push({
                            userId: student._id,
                            date: dateStr,
                            mealType,
                            rating: randomBetween(2, 5),
                            comment: Math.random() > 0.5 ? randomItem([
                                'Good food today!', 'Could be better', 'Loved the paneer!',
                                'Too much oil', 'Perfect spice level', 'Need more variety',
                                'Rice was undercooked', 'Great dal today', 'Missing salad',
                                'Best biryani ever!', 'Too salty', 'Nice and fresh',
                            ]) : '',
                            anonymous: Math.random() > 0.7,
                        });
                    }
                }
            }

            // Daily expenses
            const dailyExpenses = [
                { category: 'vegetables', amount: randomBetween(800, 2000), description: 'Daily vegetables from market' },
                { category: 'rice', amount: randomBetween(400, 800), description: 'Rice and flour' },
            ];

            // Gas every 3 days
            if (dayOffset % 3 === 0) {
                dailyExpenses.push({ category: 'gas', amount: randomBetween(300, 600), description: 'LPG cylinder refill' });
            }

            // Salary on 1st
            if (d.getDate() === 1) {
                dailyExpenses.push({ category: 'salary', amount: randomBetween(15000, 25000), description: 'Cook and helper salary' });
            }

            // Dairy daily
            dailyExpenses.push({ category: 'dairy', amount: randomBetween(200, 500), description: 'Milk, curd, paneer' });

            // Spices weekly
            if (d.getDay() === 1) {
                dailyExpenses.push({ category: 'spices', amount: randomBetween(300, 700), description: 'Weekly spice restock' });
            }

            // Misc occasionally
            if (Math.random() > 0.7) {
                dailyExpenses.push({ category: 'misc', amount: randomBetween(100, 500), description: 'Miscellaneous supplies' });
            }

            for (const exp of dailyExpenses) {
                expenseRecords.push({
                    ...exp,
                    date: dateStr,
                    addedBy: treasurer._id,
                });
            }
        }

        await Menu.insertMany(menuRecords);
        console.log(`📋 Created ${menuRecords.length} menu entries`);

        await MealAttendance.insertMany(attendanceRecords);
        console.log(`✅ Created ${attendanceRecords.length} attendance records`);

        await Expense.insertMany(expenseRecords);
        console.log(`💰 Created ${expenseRecords.length} expense records`);

        await Feedback.insertMany(feedbackRecords);
        console.log(`⭐ Created ${feedbackRecords.length} feedback entries`);

        console.log('\n✨ Seed data complete!');
        console.log('\n📧 Login credentials:');
        console.log('  Admin:     admin@messwala.com / admin123');
        console.log('  Manager:   manager@messwala.com / manager123');
        console.log('  Treasurer: treasurer@messwala.com / treasurer123');
        console.log('  Student:   arjun@messwala.com / student123');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seed();
