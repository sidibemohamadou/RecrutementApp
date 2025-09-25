import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Only log actual errors, not expected test errors
  if (!args[0]?.toString().includes('Test error') && 
      !args[0]?.toString().includes('Expected error')) {
    originalConsoleError(...args);
  }
};

// Global test setup
beforeEach(() => {
  // Reset any global state if needed
});

afterEach(() => {
  // Cleanup after each test
});