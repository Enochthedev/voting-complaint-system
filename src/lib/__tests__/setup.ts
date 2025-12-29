/**
 * Test setup file for Vitest
 * Configures global test environment and utilities
 */

import { beforeEach, afterEach, vi } from 'vitest';

// Mock environment variables for tests
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('NODE_ENV', 'test');

// Global test setup
beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Cleanup after each test
});

// Configure fast-check for property-based testing
export const FC_CONFIG = {
  numRuns: 100, // Number of test cases to generate
  seed: 42, // Fixed seed for reproducible tests
  verbose: false,
};
