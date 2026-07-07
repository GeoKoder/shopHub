import mongoose from 'mongoose';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
});

afterAll(async () => {
  // Clean up database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});