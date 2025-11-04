// Load env vars FIRST before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/errorMiddleware');

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CodeChat API is running...',
    env: config.nodeEnv,
    jwtConfigured: !!process.env.JWT_SECRET
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`✅ JWT Secret configured: ${!!process.env.JWT_SECRET}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
