import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import evaluationRoutes from './src/routes/evaluationRoutes.js';
import leaderboardRoutes from './src/routes/leaderboardRoutes.js';
import connectDB from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

const app = express();

function configuredOrigins() {
  const configured = [process.env.CLIENT_URL, ...(process.env.CLIENT_URLS || '').split(',')]
    .map((value) => value?.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    configured.push('http://localhost:5173');
  }

  return new Set(configured.map((value) => {
    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error(`Invalid frontend origin in CLIENT_URL/CLIENT_URLS: ${value}`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== value.replace(/\/$/, '')) {
      throw new Error(`Frontend CORS values must be origins without paths: ${value}`);
    }
    return parsed.origin;
  }));
}

const allowedOrigins = configuredOrigins();

async function requireDatabase(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (such as health checks) are not browser CORS requests.
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/evaluations', requireDatabase, evaluationRoutes);
app.use('/api/leaderboard', requireDatabase, leaderboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
