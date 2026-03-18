// Jest setup file for backend tests
// Add any global test configuration here

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Global timeout
jest.setTimeout(10000);

// Suppress console errors during tests (optional)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };
