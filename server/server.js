import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { globalErrorHandler, notFound } from './middleware/errorHandler.js';
import { securityHeaders, corsOptions, generalLimiter } from './middleware/security.js';
import { devLogger, prodLogger, errorLogger, requestLogger } from './middleware/logger.js';
import { authenticateSocket, handleConnection } from './socket/socketHandlers.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Make io available in req object
app.set('io', io);

// Connect to database
connectDB();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(devLogger);
} else {
  app.use(prodLogger);
  app.use(errorLogger);
}
app.use(requestLogger);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Socket.IO authentication and connection handling
io.use(authenticateSocket);
handleConnection(io);

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
📊 Health check: http://localhost:${PORT}/health
🔗 API Base URL: http://localhost:${PORT}/api
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down due to uncaught exception');
  process.exit(1);
});

export default app;