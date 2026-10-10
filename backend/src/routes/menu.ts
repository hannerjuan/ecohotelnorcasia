import { Router } from 'express';
import { prisma } from '../db.js';
import { menuItemSchema } from '../lib/schemas.js';
import { requireAdmin } from '../middleware/auth.js';
import { parseBody } from '../middleware/validate.js';

// Menú del restaurante.
export const menuRouter = Router();

menuRouter.get('/', async (req, res) => {
  const all = req.query.all === 'true' && req.user?.role === 'admin';
  res.json(
    await prisma.menuItem.findMany({
      where: all ? undefined : { available: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    }),
  );
});

menuRouter.post('/', requireAdmin, async (req, res) => {
  res.status(201).json(await prisma.menuItem.create({ data: parseBody(menuItemSchema, req.body) }));
});

menuRouter.put('/:id', requireAdmin, async (req, res) => {
  res.json(await prisma.menuItem.update({ where: { id: String(req.params.id) }, data: parseBody(menuItemSchema, req.body) }));
});

menuRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.menuItem.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
