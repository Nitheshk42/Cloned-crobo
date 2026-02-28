const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transferRoutes = require('./routes/transferRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const recipientRoutes = require('./routes/recipientRoutes');
const swaggerSpec = require('./swagger');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://localhost:3000', 'https://localhost:3001'],
  credentials: true,
}));
// For Stripe webhooks, we need raw body, so we set this route before the JSON parser
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
// For all other routes, use JSON body parser
app.use(express.json());
app.use(cookieParser());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/recipient', recipientRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Crobo Backend is running! 🚀' });
});

module.exports = app;