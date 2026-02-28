const jwt = require('jsonwebtoken');
const logger = require('../logger');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No token provided');
      return res.status(401).json({ message: 'No token provided!' });
    }

    const token = authHeader.split(' ')[1];

    // Now verifies using ACCESS_TOKEN_SECRET
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    logger.warn('Invalid token', { error: error.message });
    return res.status(401).json({ message: 'Invalid or expired token!' });
  }
};

module.exports = { protect };