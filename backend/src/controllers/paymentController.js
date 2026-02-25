require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const logger = require('../logger');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── CREATE PAYMENT INTENT ───────────────────────────────────
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    // Validate amount
    if (!amount || amount < 10) {
      return res.status(400).json({ message: 'Minimum top up amount is $10!' });
    }

    // Create payment intent with Stripe
    // Amount must be in cents! $10 = 1000 cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { userId }
    });

    logger.info('Payment intent created', { userId, amount });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    logger.error('Payment intent error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── WEBHOOK — STRIPE CALLS THIS AFTER PAYMENT ──────────────
const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.warn('Webhook signature failed', { error: err.message });
      return res.status(400).json({ message: 'Webhook error!' });
    }

    // Payment succeeded!
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const amount = paymentIntent.amount / 100; // Convert cents to dollars

      // Add balance to user
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } }
      });

      logger.info('Balance topped up via webhook', { userId, amount });
    }

    res.status(200).json({ received: true });

  } catch (error) {
    logger.error('Webhook error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

// ─── CONFIRM PAYMENT (Alternative to webhook for testing) ────
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.userId;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed!' });
    }

    const amount = paymentIntent.amount / 100;

    // Check if already processed
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Add balance to user
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } }
    });
        // Save deposit record
        await prisma.deposit.create({
        data: {
            userId,
            amount,
            status: 'Completed'
        }
        });
    logger.info('Balance topped up', { userId, amount });

    res.status(200).json({
      message: `$${amount} added to your balance!`,
      newBalance: user.balance + amount
    });

  } catch (error) {
    logger.error('Confirm payment error', { error: error.message });
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

module.exports = { createPaymentIntent, handleWebhook, confirmPayment };