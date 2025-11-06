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
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
app.use(helmet());

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'CodeChat API is running...',
    env: config.nodeEnv,
    jwtConfigured: !!process.env.JWT_SECRET,
    socketConnected: true,
    port: server.address()?.port || config.port,
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Error handler (must be last)
app.use(errorHandler);

// Function to find available port
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

// Start server with auto-port selection
const startServer = async () => {
  try {
    const desiredPort = config.port || 5000;
    const availablePort = await findAvailablePort(desiredPort);
    
    server.listen(availablePort, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${availablePort}`);
      console.log(`✅ JWT Secret configured: ${!!process.env.JWT_SECRET}`);
      console.log(`✅ Socket.io initialized`);
      
      // Save port to file for frontend to read
      const portFile = path.join(__dirname, '../../.server-port');
      fs.writeFileSync(portFile, availablePort.toString());
      console.log(`📝 Port ${availablePort} saved to .server-port`);
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
  const portFile = path.join(__dirname, '../../.server-port');
  if (fs.existsSync(portFile)) {
    fs.unlinkSync(portFile);
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
