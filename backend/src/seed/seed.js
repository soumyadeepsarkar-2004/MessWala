const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');
const Expense = require('../models/Expense');
const Menu = require('../models/Menu');
const Feedback = require('../models/Feedback');
const Task = require('../models/Task');

console.log('🚨 WARNING: This seed script is for DEVELOPMENT ONLY');
console.log('   It creates demo users and historical data.');
console.log('   DO NOT RUN in production!');
console.log('   Set ALLOW_SEED=true environment variable to proceed.\n');

if (process.env.ALLOW_SEED !== 'true') {
    console.log('⏭️  Skipping seed. To seed data, set ALLOW_SEED=true');
    process.exit(0);
}

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
            Task.deleteMany({}),
        ]);
        console.log('🧹 Cleared existing data');

        // Create users
        const users = await User.create([
            { name: 'Admin User', email: 'admin@messwala.com', password: 'admin123', role: 'admin', roomNumber: 'A-101', isApproved: true, profileComplete: true },
            { name: 'Mess Manager', email: 'manager@messwala.com', password: 'manager123', role: 'manager', roomNumber: 'A-102', isApproved: true, profileComplete: true },
            { name: 'Treasurer', email: 'treasurer@messwala.com', password: 'treasurer123', role: 'treasurer', roomNumber: 'A-103', isApproved: true, profileComplete: true },
            { name: 'Arjun Sharma', email: 'arjun@messwala.com', password: 'student123', role: 'student', roomNumber: 'B-201', collegeId: 'CSE2024001', phone: '9876543210', messNumber: '1', isApproved: true, profileComplete: true },
            { name: 'Priya Patel', email: 'priya@messwala.com', password: 'student123', role: 'student', roomNumber: 'B-202', collegeId: 'CSE2024002', phone: '9876543211', messNumber: '1', isApproved: true, profileComplete: true },
            { name: 'Rahul Kumar', email: 'rahul@messwala.com', password: 'student123', role: 'student', roomNumber: 'B-203', collegeId: 'CSE2024003', phone: '9876543212', messNumber: '2', isApproved: true, profileComplete: true },
            { name: 'Sneha Gupta', email: 'sneha@messwala.com', password: 'student123', role: 'student', roomNumber: 'C-301', collegeId: 'CSE2024004', phone: '9876543213', messNumber: '2', isApproved: true, profileComplete: true },
            { name: 'Vikram Singh', email: 'vikram@messwala.com', password: 'student123', role: 'student', roomNumber: 'C-302', collegeId: 'CSE2024005', phone: '9876543214', messNumber: '1', isApproved: true, profileComplete: true },
            { name: 'Ananya Das', email: 'ananya@messwala.com', password: 'student123', role: 'student', roomNumber: 'C-303', collegeId: 'CSE2024006', phone: '9876543215', messNumber: '1', isApproved: true, profileComplete: true },
            { name: 'Rohan Mehta', email: 'rohan@messwala.com', password: 'student123', role: 'student', roomNumber: 'D-401', collegeId: 'CSE2024007', phone: '9876543216', messNumber: '2', isApproved: true, profileComplete: true },
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

        // Create tasks
        const manager = users.find((u) => u.role === 'manager');
        const taskData = [
            { title: 'Order vegetables for next week', description: 'Contact Ramesh vendor for bulk veggies order', priority: 'high', dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], assignedTo: manager._id, createdBy: users[0]._id },
            { title: 'Clean kitchen exhaust', description: 'Monthly exhaust cleaning due', priority: 'medium', dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], assignedTo: students[0]._id, createdBy: manager._id },
            { title: 'Submit monthly expense report', description: 'Compile all expenses and submit to warden', priority: 'high', dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], assignedTo: treasurer._id, createdBy: users[0]._id },
            { title: 'Fix dining hall fan', description: 'Fan #3 in the dining hall is not working', priority: 'low', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], assignedTo: manager._id, createdBy: students[1]._id },
            { title: 'Update next week menu', description: 'Plan and update the mess menu for next week', priority: 'medium', dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], assignedTo: manager._id, createdBy: users[0]._id },
            { title: 'Collect mess fees', description: 'Collect pending mess fees from 5 students', priority: 'high', dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], assignedTo: treasurer._id, createdBy: manager._id },
            { title: 'Restock disposable plates', description: 'Buy paper plates and cups for events', priority: 'low', dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], assignedTo: students[2]._id, createdBy: manager._id },
            { title: 'Organize feedback meeting', description: 'Monthly mess committee meeting with students', priority: 'medium', dueDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0], assignedTo: users[0]._id, createdBy: manager._id, completed: true, completedAt: new Date() },
        ];
        await Task.insertMany(taskData);
        console.log(`📋 Created ${taskData.length} tasks`);

        console.log('\n✨ Seed data complete!');
        console.log('\nSee README.md for demo login credentials.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seed();
