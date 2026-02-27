require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const logger = require('../logger');  // ← ADDED
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── REGISTER ───────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if all fields are provided
    if (!name || !email || !password) {
      logger.warn('Register failed - missing fields', { email });  // ← ADDED
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      logger.warn('Register failed - email already exists', { email });  // ← ADDED
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // 3. Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user to database
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    logger.info('New user registered', { userId: user.id, email: user.email });  // ← ADDED

    // 5. Return success
    res.status(201).json({
      message: 'Account created successfully!',
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    logger.error('Register error', { error: error.message });  // ← ADDED
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── LOGIN ──────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if all fields are provided
    if (!email || !password) {
      logger.warn('Login failed - missing fields', { email });  // ← ADDED
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logger.warn('Login failed - user not found', { email });  // ← ADDED
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // 3. Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Login failed - wrong password', { email });  // ← ADDED
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // 4. Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User logged in successfully', { userId: user.id, email });  // ← ADDED

    // 5. Return token + user info
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, balance: user.balance }
    });

  } catch (error) {
    logger.error('Login error', { error: error.message });  // ← ADDED
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── GOOGLE AUTH ─────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: `google_${googleId}`,
          balance: 0
        }
      });
      logger.info('New Google user registered', { userId: user.id, email });
    } else {
      logger.info('Google user logged in', { userId: user.id, email });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Google login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, balance: user.balance }
    });

  } catch (error) {
    logger.error('Google auth error', { error: error.message });
    res.status(401).json({ message: 'Google authentication failed!' });
  }
};
// ─── LOGOUT ──────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.info('User logged out', { userId });
    res.status(200).json({ message: 'Logged out successfully!' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

module.exports = { register, login, googleAuth, logout };