import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import aiRoutes from './routes/ai.routes.js';
import topicsRoutes from './routes/topics.routes.js';
import companiesRoutes from './routes/companies.routes.js';
import questionsRoutes from './routes/questions.routes.js';
import sessionsRoutes from './routes/sessions.routes.js';

const app = express();

const allowedOrigins = [
  env.clientUrl,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/sessions', sessionsRoutes);

app.use(errorHandler); // must be last

export default app;
