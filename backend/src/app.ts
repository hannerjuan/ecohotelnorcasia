import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { loadUser } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { activitiesRouter } from './routes/activities.js';
import { authRouter } from './routes/auth.js';
import { cabinsRouter } from './routes/cabins.js';
import { eventsRouter } from './routes/events.js';
import { menuRouter } from './routes/menu.js';
import { reservationsRouter } from './routes/reservations.js';
import { reviewsRouter } from './routes/reviews.js';
import { settingsRouter } from './routes/settings.js';
import { uploadsRouter } from './routes/uploads.js';
import { usersRouter } from './routes/users.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  if (config.corsOrigin) app.use(cors({ origin: config.corsOrigin.split(','), credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(loadUser);

  app.use('/uploads', express.static(config.uploadDir, { maxAge: '30d', immutable: true }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/cabins', cabinsRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/api/reservations', reservationsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/menu', menuRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/admin/events', eventsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
