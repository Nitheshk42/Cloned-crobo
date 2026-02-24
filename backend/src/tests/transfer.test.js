require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

let token = '';
let userId = '';

// ─── SETUP — Login before all tests ─────────────────────────
beforeAll(async () => {
  // Create test user first (in case it doesn't exist)
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Delete existing test user if exists
  await prisma.user.deleteMany({
    where: { email: 'john@email.com' }
  });

  // Create fresh test user
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@email.com',
      password: hashedPassword,
      balance: 1000
    }
  });

  // Login to get token
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'john@email.com',
      password: 'password123'
    });

  token = response.body.token;
  userId = user.id;
});

// ─── UNIT TESTS ─────────────────────────────────────────────
describe('Unit Tests — Transfer Calculation', () => {

  // Test 1: Fee calculation
  test('should calculate fee correctly', () => {
    const amount = 100;
    const FLAT_FEE = 2.99;
    const amountAfterFee = amount - FLAT_FEE;
    expect(amountAfterFee).toBe(97.01);
  });

  // Test 2: Recipient calculation
  test('should calculate recipient amount correctly', () => {
    const amountAfterFee = 97.01;
    const exchangeRate = 83.12;
    const recipientGets = (amountAfterFee * exchangeRate).toFixed(2);
    expect(recipientGets).toBe('8063.47');
  });

  // Test 3: Amount too low
  test('should fail if amount is less than fee', () => {
    const amount = 2;
    const FLAT_FEE = 2.99;
    const isValid = amount > FLAT_FEE;
    expect(isValid).toBe(false);
  });

});

// ─── INTEGRATION TESTS ──────────────────────────────────────
describe('Integration Tests — Transfer API', () => {

  // Test 4: Get balance
  test('should get user balance successfully', async () => {
    const response = await request(app)
      .get('/api/transfer/balance')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty('balance');
  });

  // Test 5: Send money successfully
  test('should send money successfully', async () => {
    const response = await request(app)
      .post('/api/transfer/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amountSent: 100,
        amountReceived: 8067.07,
        currency: 'INR',
        country: 'India',
        exchangeRate: 83.12
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Transfer successful!');
    expect(response.body.transaction).toHaveProperty('id');
  });

  // Test 6: Send money without token
  test('should fail send money without token', async () => {
    const response = await request(app)
      .post('/api/transfer/send')
      .send({
        amountSent: 100,
        amountReceived: 8067.07,
        currency: 'INR',
        country: 'India',
        exchangeRate: 83.12
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token! Please login first.');
  });

  // Test 7: Send money with insufficient balance
  test('should fail if insufficient balance', async () => {
    const response = await request(app)
      .post('/api/transfer/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amountSent: 99999,
        amountReceived: 8067.07,
        currency: 'INR',
        country: 'India',
        exchangeRate: 83.12
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient balance!');
  });

  // Test 8: Get transaction history
  test('should get transaction history', async () => {
    const response = await request(app)
      .get('/api/transfer/history')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('transactions');
    expect(Array.isArray(response.body.transactions)).toBe(true);
  });

});

// ─── CLEANUP ────────────────────────────────────────────────
afterAll(async () => {
  await prisma.$disconnect();
});