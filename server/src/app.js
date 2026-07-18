import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import phase2Routes from './routes/phase2Routes.js';
import usersRoutes from './routes/usersRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import phasesRoutes from './routes/phasesRoutes.js';
import budgetsRoutes from './routes/budgetsRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// The application runs behind the client container's reverse proxy.
// Trusting its single proxy prevents rate-limit warnings and preserves client IPs.
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', phasesRoutes);
app.use('/api', budgetsRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', phase2Routes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'SiteForge API is running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });
});

app.use(errorHandler);

export default app;
