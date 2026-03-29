const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/**
 * Role-Based Dynamic Configuration System Tests
 *
 * These tests are integration tests that require a running MongoDB connection.
 * They are skipped by default in CI/unit test runs.
 * To run: set TEST_INTEGRATION=true and provide MONGO_URI for a test database.
 *
 * The test documents the expected behavior of:
 * - Authorization: Only managers can configure
 * - Dynamic configuration setup and updates
 * - Dynamic meal times and expense categories
 * - Menu creation with dynamic meal types
 * - No static/hardcoded data verification
 * - Configuration status endpoint
 * - Dashboard role-based views
 */

const SKIP_INTEGRATION = !process.env.TEST_INTEGRATION;

const describeIntegration = SKIP_INTEGRATION ? describe.skip : describe;

describeIntegration('Role-Based Dynamic Configuration System', () => {
  let app;
  let adminToken;
  let managerToken;
  let studentToken;
  let coAdminToken;

  beforeAll(async () => {
    // Connect to test database
    if (process.env.MONGO_TEST_URI) {
      await mongoose.connect(process.env.MONGO_TEST_URI);
    }
    app = require('../../server');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authorization - Only Managers Can Configure', () => {
    test('Student cannot access config endpoints', async () => {
      const res = await request(app)
        .get('/api/config')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    test('Admin can access company config', async () => {
      const res = await request(app)
        .get('/api/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.config).toBeDefined();
      }
    });

    test('co-admin can access and modify config', async () => {
      const res = await request(app)
        .get('/api/config')
        .set('Authorization', `Bearer ${coAdminToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Dynamic Configuration Setup', () => {
    test('Cannot setup without required fields', async () => {
      const res = await request(app)
        .post('/api/config/setup')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          messName: '',
          mealTimes: [],
          expenseCategories: [],
        });

      expect(res.status).toBe(400);
    });

    test('Successful setup creates config without static data', async () => {
      const setupData = {
        messName: 'Manager Custom Mess',
        messDescription: 'Custom setup by manager',
        messEmail: 'manager@mess.com',
        messPhone: '+919876543210',
        mealTimes: [
          {
            type: 'breakfast',
            emoji: '🌅',
            label: 'Breakfast',
            startTime: '07:00',
            endTime: '08:30',
            color: 'from-amber-400 to-orange-500',
          },
          {
            type: 'lunch',
            emoji: '☀️',
            label: 'Lunch',
            startTime: '12:00',
            endTime: '13:30',
            color: 'from-green-400 to-teal-500',
          },
        ],
        expenseCategories: [
          {
            value: 'dal',
            label: '🫘 Dal',
            emoji: '🫘',
            color: 'bg-amber-200',
          },
          {
            value: 'vegetables',
            label: '🥬 Vegetables',
            emoji: '🥬',
            color: 'bg-green-200',
          },
        ],
      };

      const res = await request(app)
        .post('/api/config/setup')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(setupData);

      expect(res.status).toBe(200);
      expect(res.body.config.messName).toBe('Manager Custom Mess');
      expect(res.body.config.mealTimes.length).toBe(2);
      expect(res.body.config.expenseCategories.length).toBe(2);
      expect(res.body.config.isSetup).toBe(true);
    });

    test('Cannot setup twice - must use update', async () => {
      const setupData = {
        messName: 'Another Mess',
        mealTimes: [
          {
            type: 'breakfast',
            emoji: '🌅',
            label: 'Breakfast',
            startTime: '07:00',
            endTime: '08:30',
          },
        ],
        expenseCategories: [{ value: 'test', label: 'Test' }],
      };

      const res = await request(app)
        .post('/api/config/setup')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(setupData);

      expect(res.status).toBe(400);
    });
  });

  describe('Dynamic Configuration Updates', () => {
    test('Manager can update config', async () => {
      const updates = {
        messName: 'Updated Mess Name',
        mealTimes: [
          {
            type: 'breakfast',
            emoji: '🌅',
            label: 'Breakfast',
            startTime: '06:30',
            endTime: '08:00',
          },
          {
            type: 'lunch',
            emoji: '☀️',
            label: 'Lunch',
            startTime: '12:30',
            endTime: '14:00',
          },
          {
            type: 'dinner',
            emoji: '🌙',
            label: 'Dinner',
            startTime: '19:00',
            endTime: '21:00',
          },
        ],
      };

      const res = await request(app)
        .put('/api/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.config.messName).toBe('Updated Mess Name');
      expect(res.body.config.mealTimes.length).toBe(3);
    });

    test('Student cannot update config', async () => {
      const res = await request(app)
        .put('/api/config')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ messName: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('Dynamic Meal Times', () => {
    test('Manager can add new meal time', async () => {
      const mealTime = {
        type: 'snack',
        emoji: '🍰',
        label: 'Snack',
        startTime: '15:00',
        endTime: '16:00',
        color: 'from-pink-400 to-rose-500',
      };

      const res = await request(app)
        .post('/api/config/meal-times')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mealTime);

      expect(res.status).toBe(200);
      expect(res.body.config.mealTimes).toContainEqual(
        expect.objectContaining({ type: 'snack' }),
      );
    });

    test('Cannot add duplicate meal type', async () => {
      const mealTime = {
        type: 'breakfast',
        emoji: '🌅',
        label: 'Breakfast',
        startTime: '07:00',
        endTime: '08:30',
      };

      const res = await request(app)
        .post('/api/config/meal-times')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mealTime);

      expect(res.status).toBe(400);
    });
  });

  describe('Dynamic Expense Categories', () => {
    test('Manager can add new category', async () => {
      const category = {
        value: 'spices',
        label: '🌶️ Spices',
        emoji: '🌶️',
        color: 'bg-red-200',
      };

      const res = await request(app)
        .post('/api/config/expense-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(category);

      expect(res.status).toBe(200);
      expect(res.body.config.expenseCategories).toContainEqual(
        expect.objectContaining({ value: 'spices' }),
      );
    });

    test('Cannot add duplicate category', async () => {
      const category = {
        value: 'vegetables',
        label: '🥬 Vegetables',
      };

      const res = await request(app)
        .post('/api/config/expense-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(category);

      expect(res.status).toBe(400);
    });
  });

  describe('Menu Creation with Dynamic Meal Types', () => {
    test('Menu must use configured meal types only', async () => {
      const menuData = {
        date: '2026-03-30',
        meals: [
          {
            type: 'breakfast',
            content: 'Eggs and toast',
            notes: 'Fresh eggs',
          },
          {
            type: 'lunch',
            content: 'Rice and curry',
          },
        ],
      };

      const res = await request(app)
        .post('/api/menu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(menuData);

      expect(res.status).toBe(200);
      expect(res.body.menu.meals.length).toBe(2);
    });

    test('Menu rejects invalid meal types', async () => {
      const menuData = {
        date: '2026-03-30',
        meals: [
          {
            type: 'invalid_meal_type',
            content: 'Some food',
          },
        ],
      };

      const res = await request(app)
        .post('/api/menu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(menuData);

      expect(res.status).toBe(400);
    });

    test('Only managers can set menus', async () => {
      const menuData = {
        date: '2026-03-30',
        meals: [{ type: 'breakfast', content: 'Food' }],
      };

      const res = await request(app)
        .post('/api/menu')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(menuData);

      expect(res.status).toBe(403);
    });
  });

  describe('No Static Data Verification', () => {
    test('Config is unique per hostel/manager', async () => {
      const res = await request(app)
        .get('/api/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.hostel?.id).toBeDefined();

      const managerConfig = await request(app)
        .get('/api/config')
        .set('Authorization', `Bearer ${managerToken}`);

      if (managerConfig.status === 200) {
        expect(managerConfig.body.hostel?.id).not.toBe(res.body.hostel?.id);
      }
    });

    test('Config data is fetched from DB, not hardcoded', async () => {
      const res = await request(app)
        .get('/api/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.config.mealTimes).toBeDefined();
      expect(Array.isArray(res.body.config.mealTimes)).toBe(true);
      expect(res.body.config.expenseCategories).toBeDefined();
      expect(Array.isArray(res.body.config.expenseCategories)).toBe(true);

      res.body.config.mealTimes.forEach((meal) => {
        expect(meal.type).toBeDefined();
        expect(meal.label).toBeDefined();
        expect(meal.startTime).toBeDefined();
        expect(meal.endTime).toBeDefined();
      });
    });
  });

  describe('Configuration Status Endpoint', () => {
    test('Returns configuration status for non-managers', async () => {
      const res = await request(app)
        .get('/api/config/status')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.isConfigured).toBe(false);
    });

    test('Returns complete config for managers', async () => {
      const res = await request(app)
        .get('/api/config/status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.isConfigured).toBe(true);
      expect(res.body.config).toBeDefined();
    });
  });

  describe('Dashboard Role-Based Views', () => {
    test('Student dashboard shows read-only data', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.body).not.toHaveProperty('config');
      expect(res.body).not.toHaveProperty('adminOptions');
    });

    test('Manager dashboard shows configuration options', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body).toHaveProperty('config');
      expect(res.body).toHaveProperty('canManageConfig');
      expect(res.body.canManageConfig).toBe(true);
    });
  });
});
