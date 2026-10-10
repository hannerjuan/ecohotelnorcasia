import { Router } from 'express';
import { prisma } from '../db.js';
import { notFound } from '../lib/errors.js';
import { activitySchema } from '../lib/schemas.js';
import { requireAdmin } from '../middleware/auth.js';
import { parseBody } from '../middleware/validate.js';

export const activitiesRouter = Router();

activitiesRouter.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 100);
  res.json(await prisma.activity.findMany({ orderBy: { createdAt: 'asc' }, take: limit }));
});

activitiesRouter.get('/:id', async (req, res) => {
  const activity = await prisma.activity.findUnique({ where: { id: String(req.params.id) } });
  if (!activity) throw notFound('Actividad');
  res.json(activity);
});

activitiesRouter.post('/', requireAdmin, async (req, res) => {
  res.status(201).json(await prisma.activity.create({ data: parseBody(activitySchema, req.body) }));
});

activitiesRouter.put('/:id', requireAdmin, async (req, res) => {
  res.json(await prisma.activity.update({ where: { id: String(req.params.id) }, data: parseBody(activitySchema, req.body) }));
});

activitiesRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.activity.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
