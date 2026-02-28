require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const logger = require('../logger');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── TOKEN HELPERS ────────────────────────────────────────────
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
  );
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,      // JS cannot read this!
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in ms
  });
};

// ─── REGISTER ────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      logger.warn('Register failed - missing fields', { email });
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn('Register failed - email already exists', { email });
      return res.status(400).json({ message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    logger.info('New user registered', { userId: user.id, email: user.email });

    res.status(201).json({
      message: 'Account created successfully!',
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    logger.error('Register error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login failed - missing fields', { email });
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn('Login failed - user not found', { email });
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login failed - wrong password', { email });
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // Generate both tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in httpOnly cookie
    setRefreshCookie(res, refreshToken);

    logger.info('User logged in successfully', { userId: user.id, email });

    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, balance: user.balance }
    });

  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── REFRESH TOKEN ───────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token!' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Get user from DB
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ message: 'User not found!' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    logger.info('Access token refreshed', { userId: user.id });

    res.status(200).json({ accessToken });

  } catch (error) {
    logger.error('Refresh token error', { error: error.message });
    res.status(401).json({ message: 'Invalid or expired refresh token!' });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    logger.info('User logged out', { userId });
    res.status(200).json({ message: 'Logged out successfully!' });

  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── GOOGLE AUTH ─────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { name, email, password: `google_${googleId}`, balance: 0 }
      });
      logger.info('New Google user registered', { userId: user.id, email });
    } else {
      logger.info('Google user logged in', { userId: user.id, email });
    }

    // Generate both tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in httpOnly cookie
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      message: 'Google login successful!',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, balance: user.balance }
    });

  } catch (error) {
    logger.error('Google auth error', { error: error.message });
    res.status(401).json({ message: 'Google authentication failed!' });
  }
};

module.exports = { register, login, logout, refresh, googleAuth };