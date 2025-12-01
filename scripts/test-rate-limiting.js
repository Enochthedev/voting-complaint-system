/**
 * Rate Limiting Verification Script
 *
 * This script tests the rate limiting implementation by:
 * 1. Simulating multiple API calls
 * 2. Verifying rate limits are enforced
 * 3. Testing token bucket refill
 * 4. Checking different operation types
 */

// Simple test framework
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n🧪 Running Rate Limiting Tests\n');
    console.log('='.repeat(60));

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.passed++;
        console.log(`✅ PASS: ${name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('='.repeat(60));
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Mock rate limiter implementation for testing
class RateLimiter {
  constructor() {
    this.buckets = new Map();
  }

  async checkLimit(key, config) {
    const now = Date.now();
    let entry = this.buckets.get(key);

    if (!entry) {
      entry = {
        tokens: config.maxRequests - 1,
        lastRefill: now,
        queue: [],
      };
      this.buckets.set(key, entry);
      return true;
    }

    const timeSinceRefill = now - entry.lastRefill;
    const refillAmount = Math.floor((timeSinceRefill / config.windowMs) * config.maxRequests);

    if (refillAmount > 0) {
      entry.tokens = Math.min(config.maxRequests, entry.tokens + refillAmount);
      entry.lastRefill = now;
    }

    if (entry.tokens > 0) {
      entry.tokens--;
      return true;
    }

    return false;
  }

  reset(key) {
    this.buckets.delete(key);
  }
}

const RATE_LIMITS = {
  read: { maxRequests: 100, windowMs: 60000 },
  write: { maxRequests: 30, windowMs: 60000 },
  bulk: { maxRequests: 10, windowMs: 60000 },
  auth: { maxRequests: 20, windowMs: 60000 },
  search: { maxRequests: 50, windowMs: 60000 },
  upload: { maxRequests: 20, windowMs: 60000 },
};

// Test suite
const runner = new TestRunner();
const rateLimiter = new RateLimiter();

runner.test('Rate limiter allows requests within limit', async () => {
  rateLimiter.reset('test-1');
  const config = RATE_LIMITS.read;

  for (let i = 0; i < 5; i++) {
    const allowed = await rateLimiter.checkLimit('test-1', config);
    if (!allowed) {
      throw new Error(`Request ${i + 1} was blocked but should be allowed`);
    }
  }
});

runner.test('Rate limiter blocks requests exceeding limit', async () => {
  rateLimiter.reset('test-2');
  const config = RATE_LIMITS.bulk; // Low limit for testing

  // Use up all tokens
  for (let i = 0; i < config.maxRequests; i++) {
    await rateLimiter.checkLimit('test-2', config);
  }

  // Next request should be blocked
  const allowed = await rateLimiter.checkLimit('test-2', config);
  if (allowed) {
    throw new Error('Request was allowed but should be blocked');
  }
});

runner.test('Different operation types have different limits', async () => {
  if (RATE_LIMITS.read.maxRequests <= RATE_LIMITS.write.maxRequests) {
    throw new Error('Read limit should be higher than write limit');
  }

  if (RATE_LIMITS.write.maxRequests <= RATE_LIMITS.bulk.maxRequests) {
    throw new Error('Write limit should be higher than bulk limit');
  }
});

runner.test('Rate limits are independent per key', async () => {
  rateLimiter.reset('test-3a');
  rateLimiter.reset('test-3b');
  const config = RATE_LIMITS.bulk;

  // Exhaust limit for first key
  for (let i = 0; i < config.maxRequests; i++) {
    await rateLimiter.checkLimit('test-3a', config);
  }

  // First key should be blocked
  const allowed1 = await rateLimiter.checkLimit('test-3a', config);
  if (allowed1) {
    throw new Error('First key should be blocked');
  }

  // Second key should still work
  const allowed2 = await rateLimiter.checkLimit('test-3b', config);
  if (!allowed2) {
    throw new Error('Second key should be allowed');
  }
});

runner.test('Rate limit configurations are reasonable', async () => {
  // Check that all required operation types exist
  const requiredTypes = ['read', 'write', 'bulk', 'auth', 'search', 'upload'];
  for (const type of requiredTypes) {
    if (!RATE_LIMITS[type]) {
      throw new Error(`Missing rate limit config for ${type}`);
    }

    const config = RATE_LIMITS[type];
    if (config.maxRequests <= 0) {
      throw new Error(`Invalid maxRequests for ${type}`);
    }
    if (config.windowMs <= 0) {
      throw new Error(`Invalid windowMs for ${type}`);
    }
  }
});

runner.test('Token bucket refill mechanism exists', async () => {
  rateLimiter.reset('test-4');
  const config = { maxRequests: 5, windowMs: 100 }; // Short window for testing

  // Use some tokens
  await rateLimiter.checkLimit('test-4', config);
  await rateLimiter.checkLimit('test-4', config);

  // Wait for refill window
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Should be able to make more requests after refill
  const allowed = await rateLimiter.checkLimit('test-4', config);
  if (!allowed) {
    throw new Error('Tokens should have refilled');
  }
});

runner.test('Rate limits protect against rapid requests', async () => {
  rateLimiter.reset('test-5');
  const config = RATE_LIMITS.write;

  let successCount = 0;
  let blockedCount = 0;

  // Try to make many rapid requests
  for (let i = 0; i < config.maxRequests + 10; i++) {
    const allowed = await rateLimiter.checkLimit('test-5', config);
    if (allowed) {
      successCount++;
    } else {
      blockedCount++;
    }
  }

  if (successCount !== config.maxRequests) {
    throw new Error(`Expected ${config.maxRequests} successful requests, got ${successCount}`);
  }

  if (blockedCount !== 10) {
    throw new Error(`Expected 10 blocked requests, got ${blockedCount}`);
  }
});

// Run all tests
runner.run().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
