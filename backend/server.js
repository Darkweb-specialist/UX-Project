const express = require('express');
const cors = require('cors');
const path = require('path');
const donationRoutes = require('./routes/donationRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root welcome
app.get('/', (req, res) => {
  res.json({
    app: 'Smart Food Donation & Pickup App API',
    version: '1.0.0',
    status: 'Operational',
    endpoints: {
      health: '/api/health',
      donations: '/api/donations',
      pickups: '/api/pickups',
      stats: '/api/stats',
    },
  });
});

// Health check endpoint for mobile app and Kubernetes probes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'smart-food-donation-backend',
  });
});

// Mount Routes
app.use('/api/donations', donationRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/stats', statsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

// Start server
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Smart Food Donation Backend Server Running!`);
    console.log(`📡 Listening on: http://localhost:${PORT}`);
    console.log(`📋 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🍽️ Donations API: http://localhost:${PORT}/api/donations`);
    console.log(`=======================================================`);
  });

  // Handle process termination gracefully
  const shutdown = () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('Server terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
