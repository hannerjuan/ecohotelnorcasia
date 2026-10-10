import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db.js';
import { bookedRanges } from '../lib/availability.js';
import { DATE_RE, parseDate } from '../lib/dates.js';
import { notFound } from '../lib/errors.js';
import { cabinSchema } from '../lib/schemas.js';
import { requireAdmin } from '../middleware/auth.js';
import { parseBody } from '../middleware/validate.js';

export const cabinsRouter = Router();

async function ratingsByCabin(ids: string[]) {
  const groups = await prisma.review.groupBy({
    by: ['cabinId'],
    where: { cabinId: { in: ids } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(groups.map((g) => [g.cabinId, { averageRating: g._avg.rating, reviewCount: g._count._all }]));
}

cabinsRouter.get('/', async (req, res) => {
  const featured = req.query.featured === 'true';
  const limit = Math.min(Number(req.query.limit) || 100, 100);
  const cabins = await prisma.cabin.findMany({
    where: featured ? { featured: true } : undefined,
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
  const ratings = await ratingsByCabin(cabins.map((c) => c.id));

  // Búsqueda por fechas y personas: marca cada cabaña como disponible o no.
  const { checkIn, checkOut } = req.query;
  const guests = Number(req.query.guests) || 0;
  let busy: Set<string> | null = null;
  if (typeof checkIn === 'string' && typeof checkOut === 'string' && DATE_RE.test(checkIn) && DATE_RE.test(checkOut) && checkOut > checkIn) {
    const conflicts = await prisma.reservation.findMany({
      where: { status: 'confirmed', checkIn: { lt: parseDate(checkOut) }, checkOut: { gt: parseDate(checkIn) } },
      select: { cabinId: true },
    });
    busy = new Set(conflicts.map((r) => r.cabinId));
  }

  res.json(
    cabins
      .filter((c) => c.capacity >= guests)
      .map((c) => ({
        ...c,
        ...(ratings.get(c.id) ?? { averageRating: null, reviewCount: 0 }),
        ...(busy ? { available: !busy.has(c.id) } : {}),
      })),
  );
});

cabinsRouter.get('/:id', async (req, res) => {
  const cabin = await prisma.cabin.findUnique({ where: { id: String(req.params.id) } });
  if (!cabin) throw notFound('Cabaña');
  const ratings = await ratingsByCabin([cabin.id]);
  res.json({ ...cabin, ...(ratings.get(cabin.id) ?? { averageRating: null, reviewCount: 0 }) });
});

cabinsRouter.get('/:id/availability', async (req, res) => {
  const cabin = await prisma.cabin.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
  if (!cabin) throw notFound('Cabaña');
  res.json({ booked: await bookedRanges(prisma, cabin.id) });
});

cabinsRouter.get('/:id/reviews', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { cabinId: String(req.params.id) },
    orderBy: { createdAt: 'desc' },
    select: { id: true, cabinId: true, guestName: true, rating: true, comment: true, createdAt: true },
  });
  res.json(reviews);
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has enviado muchas reseñas. Intenta más tarde.' },
  skip: () => process.env.NODE_ENV === 'test',
});

const reviewSchema = z.object({
  guestName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1, 'El comentario es obligatorio').max(2000),
});

cabinsRouter.post('/:id/reviews', reviewLimiter, async (req, res) => {
  const data = parseBody(reviewSchema, req.body);
  const cabin = await prisma.cabin.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
  if (!cabin) throw notFound('Cabaña');
  const review = await prisma.review.create({ data: { ...data, cabinId: cabin.id } });
  res.status(201).json(review);
});

cabinsRouter.post('/', requireAdmin, async (req, res) => {
  const cabin = await prisma.cabin.create({ data: parseBody(cabinSchema, req.body) });
  res.status(201).json(cabin);
});

cabinsRouter.put('/:id', requireAdmin, async (req, res) => {
  const cabin = await prisma.cabin.update({ where: { id: String(req.params.id) }, data: parseBody(cabinSchema, req.body) });
  res.json(cabin);
});

cabinsRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.cabin.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
