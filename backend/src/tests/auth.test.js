require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

// ─── UNIT TESTS ─────────────────────────────────────────────

describe('Unit Tests — Auth', () => {

  // Test 1: Password encryption
  test('should encrypt password correctly', async () => {
    const password = 'test123';
    const hashed = await bcrypt.hash(password, 10);

    // Hashed password should not equal original
    expect(hashed).not.toBe(password);

    // bcrypt should be able to verify it
    const isMatch = await bcrypt.compare(password, hashed);
    expect(isMatch).toBe(true);
  });

  // Test 2: Wrong password should not match
  test('should not match wrong password', async () => {
    const password = 'test123';
    const hashed = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare('wrongpassword', hashed);
    expect(isMatch).toBe(false);
  });

  // Test 3: JWT token creation
test('should create a valid JWT token', () => {
  const payload = { userId: '123', email: 'test@email.com' };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  expect(token).toBeDefined();
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  expect(decoded.userId).toBe('123');
  expect(decoded.email).toBe('test@email.com');
});

// Test 4: Invalid JWT token should fail
test('should reject invalid JWT token', () => {
  expect(() => {
    jwt.verify('invalidtoken', process.env.ACCESS_TOKEN_SECRET);
  }).toThrow();
});

});

// ─── INTEGRATION TESTS ──────────────────────────────────────

describe('Integration Tests — Auth API', () => {

  // Test 5: Register a new user
  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `testuser_${Date.now()}@email.com`,
        password: 'test123'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Account created successfully!');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('email');
  });

  // Test 6: Register with missing fields
  test('should fail register if fields are missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@email.com'
        // missing name and password
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields are required!');
  });

  // Test 7: Login with wrong password
  test('should fail login with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@email.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email or password!');
  });

  // Test 8: Login with correct credentials
  test('should login successfully and return token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@email.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.message).toBe('Login successful!');
  });

  afterAll(async () => {
  const { PrismaClient } = require('@prisma/client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  await prisma.$disconnect();
});
});