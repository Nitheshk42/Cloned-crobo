require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const logger = require('../logger');  // ✅ fixed!

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FLAT_FEE = 2.99;

// ─── SEND MONEY ─────────────────────────────────────────────
const sendMoney = async (req, res) => {
  try {
    const { amountSent, amountReceived, currency, country, exchangeRate } = req.body;
    const userId = req.user.userId;

    // 1. Check all fields
    if (!amountSent || !amountReceived || !currency || !country || !exchangeRate) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // 2. Check amount is valid
    if (amountSent <= FLAT_FEE) {
      return res.status(400).json({ message: `Amount must be greater than $${FLAT_FEE}!` });
    }

    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // 4. Check user has enough balance
    if (user.balance < amountSent) {
      logger.warn('Transfer failed - insufficient balance', { userId, amountSent });  // ← ADDED
      return res.status(400).json({ message: 'Insufficient balance!' });
    }

    //  Check daily limit
      const DAILY_LIMIT = 5000;
      const WEEKLY_LIMIT = 20000;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const dailyTransactions = await prisma.transaction.findMany({
        where: { userId, status: 'Completed', createdAt: { gte: startOfDay } }
      });

      const weeklyTransactions = await prisma.transaction.findMany({
        where: { userId, status: 'Completed', createdAt: { gte: startOfWeek } }
      });

      const dailyUsed = dailyTransactions.reduce((sum, t) => sum + t.amountSent, 0);
      const weeklyUsed = weeklyTransactions.reduce((sum, t) => sum + t.amountSent, 0);

      if (dailyUsed + amountSent > DAILY_LIMIT) {
        logger.warn('Transfer failed - daily limit exceeded', { userId, dailyUsed, amountSent });
        return res.status(400).json({ 
          message: `Daily limit exceeded! You can only send $${(DAILY_LIMIT - dailyUsed).toFixed(2)} more today!` 
        });
      }

      if (weeklyUsed + amountSent > WEEKLY_LIMIT) {
        logger.warn('Transfer failed - weekly limit exceeded', { userId, weeklyUsed, amountSent });
        return res.status(400).json({ 
          message: `Weekly limit exceeded! You can only send $${(WEEKLY_LIMIT - weeklyUsed).toFixed(2)} more this week!` 
        });
      }

    // 5. Deduct balance from user
    await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance - amountSent }
    });

    // 6. Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amountSent,
        amountReceived,
        currency,
        country,
        exchangeRate,
        fee: FLAT_FEE,
        status: 'Completed'
      }
    });

    logger.info('Transfer successful', {  // ← ADDED
      userId,
      amountSent,
      currency,
      country,
      transactionId: transaction.id
    });

    // 7. Return success
    res.status(201).json({
      message: 'Transfer successful!',
      transaction
    });

  } catch (error) {
    logger.error('Transfer error', { error: error.message });  // ← ADDED
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── GET HISTORY ────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    // Get all deposits
    const deposits = await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    // Add type to each record
    const formattedTransactions = transactions.map(t => ({
      ...t,
      type: 'transfer'
    }));

    const formattedDeposits = deposits.map(d => ({
      ...d,
      type: 'deposit'
    }));

    // Combine and sort by date newest first
    const allHistory = [...formattedTransactions, ...formattedDeposits]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    logger.info('History fetched', { userId, count: transactions.length, deposits: deposits.length });  // ← ADDED

    res.status(200).json({ history: allHistory });

  } catch (error) {
    logger.error('History error', { error: error.message });  // ← ADDED
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── GET BALANCE ─────────────────────────────────────────────
const getBalance = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, name: true, email: true }
    });

    logger.info('Balance fetched', { userId });  // ← ADDED

    res.status(200).json({ user });

  } catch (error) {
    logger.error('Balance error', { error: error.message });  // ← ADDED
    res.status(500).json({ message: 'Something went wrong!' });
  }
};
// ─── GET LIMITS ──────────────────────────────────────────────
const getLimits = async (req, res) => {
  try {
    const userId = req.user.userId;

    const DAILY_LIMIT = 5000;
    const WEEKLY_LIMIT = 20000;

    // Get start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get start of this week (Monday)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get today's transactions
    const dailyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'Completed',
        createdAt: { gte: startOfDay }
      }
    });

    // Get this week's transactions
    const weeklyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'Completed',
        createdAt: { gte: startOfWeek }
      }
    });

    // Calculate used amounts
    const dailyUsed = dailyTransactions.reduce((sum, t) => sum + t.amountSent, 0);
    const weeklyUsed = weeklyTransactions.reduce((sum, t) => sum + t.amountSent, 0);

    logger.info('Limits fetched', { userId, dailyUsed, weeklyUsed });

    res.status(200).json({
      daily: {
        used: dailyUsed,
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT - dailyUsed,
        percentage: Math.round((dailyUsed / DAILY_LIMIT) * 100)
      },
      weekly: {
        used: weeklyUsed,
        limit: WEEKLY_LIMIT,
        remaining: WEEKLY_LIMIT - weeklyUsed,
        percentage: Math.round((weeklyUsed / WEEKLY_LIMIT) * 100)
      }
    });

  } catch (error) {
    logger.error('Limits error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

module.exports = { sendMoney, getHistory, getBalance, getLimits };

//module.exports = { sendMoney, getHistory, getBalance };