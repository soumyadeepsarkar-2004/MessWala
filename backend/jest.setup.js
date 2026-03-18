// Jest setup file for backend tests
// Add any global test configuration here
/* eslint-disable no-console */

// 🧪 TEST ENVIRONMENT CONFIGURATION
// ⚠️ These settings ONLY apply when running tests
// They do NOT affect production or development servers

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-not-for-production';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Suppress console output during tests (optional)
if (process.env.TEST_SILENT !== 'false') {
  global.console = {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Global timeout
jest.setTimeout(10000);

// Suppress console errors during tests (optional)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };
