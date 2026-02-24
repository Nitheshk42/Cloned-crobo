const app = require('./app');
const logger = require('./logger');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

// Log startup
logger.info('🚀 Backend starting', { port: PORT, env: process.env.NODE_ENV });

// Use HTTP on production (Render handles SSL)
// Use HTTPS on local (self signed cert)
if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    logger.info('🚀 HTTP Server running on production', {
      port: PORT
    });
    console.log(`🚀 Server running on port ${PORT}`);
  });
} else {
  const https = require('https');
  const fs = require('fs');
  const path = require('path');

  const options = {
    cert: fs.readFileSync(path.join(__dirname, '../../../certs/localhost.crt')),
    key: fs.readFileSync(path.join(__dirname, '../../../certs/localhost.key'))
  };

  https.createServer(options, app).listen(PORT, () => {
    logger.info('🔒 HTTPS Server running locally', {
      url: `https://localhost:${PORT}`,
      swagger: `https://localhost:${PORT}/api-docs`
    });
    console.log(`🔒 HTTPS Server running on https://localhost:${PORT}`);
    console.log(`📚 Swagger docs at https://localhost:${PORT}/api-docs`);
  });
}