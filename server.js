// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./src/config/database');
const sessionConfig = require('./src/config/session');
const { initGridFS } = require('./src/config/gridfs');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth');
const songRoutes = require('./src/routes/songs');
const adminRoutes = require('./src/routes/admin');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize GridFS after MongoDB connection
const mongoose = require('mongoose');
mongoose.connection.once('open', () => {
  initGridFS();
});

// CORS configuration
// --- CORS configuration ---
const allowedOrigins = [
  'http://localhost:3000',
  'https://music-player-frontend-nu.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow REST tools or server-to-server calls with no origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // allow cookies and sessions
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session(sessionConfig));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎵 Music Player API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      songs: '/api/songs',
      admin: '/api/admin'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🎵 Music Player API listening on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Available routes:');
  console.log(`  - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`  - Songs: http://localhost:${PORT}/api/songs`);
  console.log(`  - Admin: http://localhost:${PORT}/api/admin`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});