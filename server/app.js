import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import evaluationRoutes from './src/routes/evaluationRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
