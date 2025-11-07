// Load env vars FIRST before anything else
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/errorMiddleware');
const socketHandler = require('./socket/socketHandler');

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket handlers
socketHandler(io);

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' ? false : undefined,
}));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Serve frontend in production
if (config.nodeEnv === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // Serve static files
  app.use(express.static(frontendPath));
  
  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Development mode - API status
  app.get('/', (req, res) => {
    res.json({
      message: 'CodeChat API is running...',
      env: config.nodeEnv,
      jwtConfigured: !!process.env.JWT_SECRET,
      socketConnected: true,
    });
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Function to find available port (LOCAL DEVELOPMENT ONLY)
const findAvailablePort = (startPort, maxAttempts = 10) => {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    const tryPort = () => {
      if (attempts >= maxAttempts) {
        reject(new Error(`Could not find available port after ${maxAttempts} attempts`));
        return;
      }

      const testServer = http.createServer();
      
      testServer.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          currentPort++;
          console.log(`⚠️ Port ${currentPort - 1} is busy, trying ${currentPort}...`);
          tryPort();
        } else {
          reject(err);
        }
      });

      testServer.once('listening', () => {
        testServer.close(() => {
          resolve(currentPort);
        });
      });

      testServer.listen(currentPort);
    };

    tryPort();
  });
};

// Start server with SMART MODE DETECTION
const startServer = async () => {
  try {
    const desiredPort = config.port || 5000;
    let finalPort;

    // PRODUCTION MODE: Use exact PORT from environment
    if (config.nodeEnv === 'production') {
      finalPort = desiredPort;
      console.log('🏭 PRODUCTION MODE: Using fixed PORT');
    } 
    // DEVELOPMENT MODE: Auto-find available port
    else {
      finalPort = await findAvailablePort(desiredPort);
      
      // Save port file for frontend (development only)
      const portFile = path.join(__dirname, '../../.server-port');
      fs.writeFileSync(portFile, finalPort.toString());
      console.log(`📝 Port ${finalPort} saved to .server-port`);
    }
    
    server.listen(finalPort, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${finalPort}`);
      console.log(`✅ JWT Secret configured: ${!!process.env.JWT_SECRET}`);
      console.log(`✅ Socket.io initialized`);
      if (config.nodeEnv === 'production') {
        console.log(`🌐 Serving frontend from: frontend/dist`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n⚠️ Shutting down gracefully...');
  
  // Clean up port file (development only)
  if (config.nodeEnv !== 'production') {
    const portFile = path.join(__dirname, '../../.server-port');
    if (fs.existsSync(portFile)) {
      fs.unlinkSync(portFile);
    }
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});