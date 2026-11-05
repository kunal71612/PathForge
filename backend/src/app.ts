import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { router } from './routes';

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow fonts and assets from CDNs
  })
);

// Allowed CORS origins
const allowedOrigins = new Set<string>();

// Add configured frontend URL(s) from environment (supports comma-separated list)
if (config.frontendUrl) {
  config.frontendUrl.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed) allowedOrigins.add(trimmed);
  });
}

// Standard local development origins
const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
devOrigins.forEach((origin) => allowedOrigins.add(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health probes)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      // Check against explicit allowed list
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      // In non-production environments, allow any localhost/127.0.0.1 origin
      if (config.nodeEnv !== 'production') {
        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
          return callback(null, true);
        }
      }

      // Disallow unapproved origins in production
      return callback(
        new Error(`CORS blocked for origin: ${origin}. If this is your deployed frontend, add it to FRONTEND_URL in backend environment variables.`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', router);

// Serve frontend build if available
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

export default app;
