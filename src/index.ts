import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import petitionRoutes from './routes/petitions';
import confirmRoutes from './routes/confirm';
import adminRoutes from './routes/admin';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    for (const allowedOrigin of config.corsOrigins) {
      if (typeof allowedOrigin === 'string') {
        // Exact string match
        if (origin === allowedOrigin) {
          return callback(null, true);
        }
      } else if (allowedOrigin instanceof RegExp) {
        // Regex pattern match
        if (allowedOrigin.test(origin)) {
          return callback(null, true);
        }
      }
    }
    
    // Log unauthorized origin attempts
    logger.warn('CORS blocked request', { origin, allowedOrigins: config.corsOrigins });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Rate limiting (disabled in test mode and staging for development)
// TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
if (false && config.nodeEnv !== 'test' && config.nodeEnv !== 'development') {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      ok: false,
      error: 'Rate limited'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use IP + User-Agent for more granular rate limiting
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const ua = req.get('User-Agent') || '';
      return `${ip}-${ua}`;
    },
  });

  app.use('/api/petitions', limiter);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/petitions', petitionRoutes);
app.use('/api/confirm', confirmRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 - Route not found', { url: req.originalUrl, method: req.method });
  res.status(404).json({
    ok: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { 
    error: error.message, 
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(500).json({
    ok: false,
    error: 'Internal server error'
  });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info('Server started', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    appOrigin: config.appOrigin,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
