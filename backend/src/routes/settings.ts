import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { getSettings } from '../lib/settings.js';
import { imageUrl } from '../lib/schemas.js';
import { requireAdmin } from '../middleware/auth.js';
import { parseBody } from '../middleware/validate.js';

export const settingsRouter = Router();

settingsRouter.get('/', async (_req, res) => {
  const { updatedAt: _u, id: _id, ...settings } = await getSettings();
  res.json(settings);
});

const settingsSchema = z.object({
  hotelName: z.string().trim().min(1).max(100),
  whatsappNumber: z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, 'Número de WhatsApp inválido'),
  email: z.string().trim().email('Correo inválido'),
  address: z.string().trim().min(1).max(200),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  heroImages: z.array(imageUrl).max(10),
});

settingsRouter.put('/', requireAdmin, async (req, res) => {
  const data = parseBody(settingsSchema, req.body);
  const updated = await prisma.hotelSettings.upsert({
    where: { id: 1 },
    update: { ...data, whatsappNumber: data.whatsappNumber.replace(/\D/g, '') },
    create: { id: 1, ...data, whatsappNumber: data.whatsappNumber.replace(/\D/g, '') },
  });
  const { updatedAt: _u, id: _id, ...settings } = updated;
  res.json(settings);
});
