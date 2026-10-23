const dotenv = require('dotenv');
const path = require('path');
// Load environment variables from local (.env / .env.production) and root (../.env) directories
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.production') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

// Explicitly load models and associations
require('./models');

const passwordRoutes = require('./routes/passwordRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const compression = require('compression');
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

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "data:"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://tds.razorpay.com", "https://checkout.razorpay.com", "https://www.google.com", "https://maps.google.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
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
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the React/Vite app (copied to the root dist folder)
// Set caching headers for optimized asset delivery:
// - /assets (hashed JS/CSS/images) cached for 1 year (immutable)
// - index.html and dynamic/service-worker files are never cached
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const isMediaOrFont = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'].includes(ext);

    if (filePath.endsWith('.html') || filePath.endsWith('service-worker.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (/[\\/]assets[\\/]/.test(filePath) || filePath.includes('assets/') || isMediaOrFont) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Serve index.html for all non-API paths (React Router fallback)
app.get('/*splat', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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

    // Ensure columns exist on tables without spamming console
    const safeAlter = async (query) => {
      try {
        await sequelize.query(query);
      } catch (err) {
        if (!err.parent || (err.parent.code !== 'ER_DUP_FIELDNAME' && err.parent.errno !== 1060)) {
          console.error('Migration notice:', err.message);
        }
      }
    };

    await safeAlter("ALTER TABLE courses ADD COLUMN level VARCHAR(255) DEFAULT 'beginner';");
    await safeAlter("ALTER TABLE user_devices ADD COLUMN ipAddress VARCHAR(255) NULL;");
    await safeAlter("ALTER TABLE user_devices ADD COLUMN refreshToken VARCHAR(500) NULL;");
    await safeAlter("ALTER TABLE user_devices ADD COLUMN refreshTokenExpiresAt DATETIME NULL;");

    if (process.env.NODE_ENV === 'development' || process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
    } else {
      await sequelize.sync();
    }
  } catch (error) {
    console.error('Database connection failed on startup:', error);
  }
};

startDatabase();
