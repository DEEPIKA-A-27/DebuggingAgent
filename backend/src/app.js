const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter rate limit for AI analysis (applied in debugRoutes)

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Debugging Agent API is running' });
});

// Routes
const authRouter = express.Router();
require('./routes/authRoutes')(authRouter);
app.use('/api/auth', authRouter);

const debugRouter = express.Router();
require('./routes/debugRoutes')(debugRouter);
app.use('/api/debug', debugRouter);

const historyRouter = express.Router();
require('./routes/historyRoutes')(historyRouter);
app.use('/api/history', historyRouter);

const chatRouter = express.Router();
require('./routes/chatRoutes')(chatRouter);
app.use('/api/chat', chatRouter);

const settingsRouter = express.Router();
require('./routes/settingsRoutes')(settingsRouter);
app.use('/api/settings', settingsRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
