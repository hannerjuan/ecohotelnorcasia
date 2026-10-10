import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { parseBody } from '../middleware/validate.js';

// Testimonios del inicio y moderación de reseñas.
export const reviewsRouter = Router();

// Reseñas destacadas por el admin; si no hay, las mejores más recientes.
reviewsRouter.get('/featured', async (_req, res) => {
  const select = { id: true, guestName: true, rating: true, comment: true, createdAt: true, cabin: { select: { name: true } } };
  let reviews = await prisma.review.findMany({ where: { featured: true }, orderBy: { createdAt: 'desc' }, take: 6, select });
  if (reviews.length === 0) {
    reviews = await prisma.review.findMany({ where: { rating: { gte: 4 } }, orderBy: { createdAt: 'desc' }, take: 3, select });
  }
  res.json(reviews);
});

reviewsRouter.get('/', requireAdmin, async (_req, res) => {
  res.json(
    await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, include: { cabin: { select: { name: true } } } }),
  );
});

reviewsRouter.patch('/:id', requireAdmin, async (req, res) => {
  const { featured } = parseBody(z.object({ featured: z.boolean() }), req.body);
  res.json(await prisma.review.update({ where: { id: String(req.params.id) }, data: { featured } }));
});

reviewsRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.review.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
