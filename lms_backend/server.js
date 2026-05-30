const dotenv = require('dotenv');
const path = require('path');
// Load environment variables from local (.env) and root (../.env) directories
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

// Explicitly load models and associations
require('./models');


const passwordRoutes = require('./routes/passwordRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const quizRoutes = require('./routes/quizRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const emailRoutes = require('./routes/emailRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (needed for express-rate-limit behind Hostinger/Passenger)
app.set('trust proxy', 1);

// ============ RATE LIMITERS ============

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

// ============ MIDDLEWARE ============

app.use(cors());
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://tds.razorpay.com", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])],
      imgSrc: ["'self'", "data:", "https://*.razorpay.com", "https://images.unsplash.com", "https://i.pravatar.cc"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Apply rate limiters
app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============ ROUTES ============

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the React/Vite app (copied to the root dist folder)
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for all non-API paths (React Router fallback)
// Note: In Express 5, catch-all routing requires a named parameter (e.g. /*splat)
app.get('/*splat', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});





// ============ START SERVER ============

// Start server synchronously so Passenger/Hostinger can hook it immediately
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Authenticate database in the background
const startDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Database connection failed on startup:', error);
  }
};

startDatabase();