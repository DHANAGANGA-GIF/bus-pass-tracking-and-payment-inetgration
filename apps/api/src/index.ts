import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { initSocketIO } from './socket/index.js';
import { initRedis } from './services/redis.js';
import { initSentry } from './services/sentry.js';
import { startCronJobs } from './services/cron.js';

const app = express();
const server = createServer(app);

// Initialize Services
initSentry();
initRedis();
startCronJobs();
initSocketIO(server);

// CORS setup
const allowedOrigins: string[] = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        logger.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'BusPass API Server is healthy and running.' });
});
app.use('/api', routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`[Unhandled Error] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = parseInt(env.PORT, 10) || 5000;
server.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`🚌 BUS PASS PLATFORM API RUNNING ON PORT ${PORT}`);
  logger.info(`⚡ ENVIRONMENT: ${env.NODE_ENV}`);
  logger.info(`🔗 API ENDPOINT: http://localhost:${PORT}/api`);
  logger.info(`=======================================================`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});