import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db.js';
import { findConflict } from '../lib/availability.js';
import { DATE_RE, formatDate, nightsBetween, parseDate, todayUtc } from '../lib/dates.js';
import { HttpError, notFound } from '../lib/errors.js';
import { broadcast } from '../lib/events.js';
import { serializeReservation } from '../lib/serialize.js';
import { getSettings, whatsappLink } from '../lib/settings.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { parseBody } from '../middleware/validate.js';

export const reservationsRouter = Router();

const dateString = z.string().regex(DATE_RE, 'Fecha inválida (AAAA-MM-DD)');

const createSchema = z
  .object({
    cabinId: z.string().min(1),
    guestName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    checkIn: dateString,
    checkOut: dateString,
    guests: z.coerce.number().int().min(1).max(50).default(1),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,20}$/, 'Número de WhatsApp inválido'),
    notes: z.string().trim().max(1000).default(''),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: 'Debes aceptar la política de tratamiento de datos' }),
    }),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: 'La fecha de salida debe ser posterior a la de llegada',
    path: ['checkOut'],
  });

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has enviado muchas solicitudes. Intenta más tarde.' },
  skip: () => process.env.NODE_ENV === 'test',
});

// Bloquea la cabaña dentro de la transacción para evitar dos reservas simultáneas en las mismas fechas.
async function lockCabin(tx: Prisma.TransactionClient, cabinId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${cabinId}))`;
}

reservationsRouter.post('/', createLimiter, async (req, res) => {
  const data = parseBody(createSchema, req.body);
  const checkIn = parseDate(data.checkIn);
  const checkOut = parseDate(data.checkOut);
  if (checkIn < todayUtc()) throw new HttpError(400, 'La fecha de llegada no puede estar en el pasado');

  const cabin = await prisma.cabin.findUnique({ where: { id: data.cabinId } });
  if (!cabin) throw notFound('Cabaña');
  if (data.guests > cabin.capacity) {
    throw new HttpError(400, `Esta cabaña admite máximo ${cabin.capacity} personas`);
  }

  const reservation = await prisma.$transaction(async (tx) => {
    await lockCabin(tx, cabin.id);
    const conflict = await findConflict(tx, cabin.id, checkIn, checkOut);
    if (conflict) {
      throw new HttpError(409, 'La cabaña no está disponible en esas fechas', {
        availableFrom: formatDate(conflict.checkOut),
      });
    }
    return tx.reservation.create({
      data: {
        cabinId: cabin.id,
        cabinName: cabin.name,
        userId: req.user?.id,
        guestName: data.guestName,
        checkIn,
        checkOut,
        guests: data.guests,
        whatsappNumber: data.whatsappNumber,
        notes: data.notes,
      },
    });
  });

  const settings = await getSettings();
  const nights = nightsBetween(checkIn, checkOut);
  const message =
    `¡Hola ${settings.hotelName}! Me gustaría reservar la cabaña *${cabin.name}*.\n\n` +
    `*Nombre:* ${data.guestName}\n` +
    `*Check-in:* ${data.checkIn}\n` +
    `*Check-out:* ${data.checkOut}\n` +
    `*Noches:* ${nights}\n` +
    `*Personas:* ${data.guests}\n` +
    `*WhatsApp:* ${data.whatsappNumber}\n` +
    `*Código de solicitud:* ${reservation.id}\n\n` +
    `¿Está disponible para estas fechas?`;

  const payload = serializeReservation(reservation);
  broadcast('reservation.created', payload);
  res.status(201).json({
    reservation: payload,
    nights,
    total: nights * cabin.price,
    whatsappUrl: whatsappLink(settings.whatsappNumber, message),
  });
});

// Reservas del huésped con sesión iniciada.
reservationsRouter.get('/mine', requireAuth, async (req, res) => {
  const rows = await prisma.reservation.findMany({
    where: { userId: req.user!.id },
    orderBy: { checkIn: 'desc' },
  });
  res.json(rows.map(serializeReservation));
});

const filterSchema = z.object({
  cabinId: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  q: z.string().trim().optional(),
});

function buildWhere(query: unknown): Prisma.ReservationWhereInput {
  const f = parseBody(filterSchema, query);
  return {
    cabinId: f.cabinId || undefined,
    status: f.status,
    // Reservas que se cruzan con el rango pedido.
    checkOut: f.from ? { gt: parseDate(f.from) } : undefined,
    checkIn: f.to ? { lte: parseDate(f.to) } : undefined,
    OR: f.q
      ? [
          { guestName: { contains: f.q, mode: 'insensitive' } },
          { whatsappNumber: { contains: f.q } },
          { id: { startsWith: f.q } },
        ]
      : undefined,
  };
}

reservationsRouter.get('/', requireAdmin, async (req, res) => {
  const rows = await prisma.reservation.findMany({ where: buildWhere(req.query), orderBy: { createdAt: 'desc' } });
  res.json(rows.map(serializeReservation));
});

const STATUS_LABEL = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada' } as const;

function csvCell(value: unknown) {
  const s = String(value ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

reservationsRouter.get('/export.csv', requireAdmin, async (req, res) => {
  const rows = await prisma.reservation.findMany({
    where: buildWhere(req.query),
    orderBy: { checkIn: 'asc' },
    include: { cabin: { select: { price: true } } },
  });
  const header = ['ID', 'Nombre', 'Cabaña', 'Check-in', 'Check-out', 'Noches', 'Personas', 'WhatsApp', 'Estado', 'Total', 'Fecha de creación'];
  const lines = rows.map((r) => {
    const nights = nightsBetween(r.checkIn, r.checkOut);
    return [
      r.id,
      r.guestName,
      r.cabinName,
      formatDate(r.checkIn),
      formatDate(r.checkOut),
      nights,
      r.guests,
      r.whatsappNumber,
      STATUS_LABEL[r.status],
      nights * r.cabin.price,
      r.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(',');
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="reservas_${formatDate(new Date())}.csv"`);
  // BOM para que Excel reconozca las tildes.
  res.send('﻿' + [header.join(','), ...lines].join('\n'));
});

reservationsRouter.get('/:id', requireAdmin, async (req, res) => {
  const r = await prisma.reservation.findUnique({
    where: { id: String(req.params.id) },
    include: { cabin: { select: { price: true, name: true, imageUrl: true } } },
  });
  if (!r) throw notFound('Reserva');
  const nights = nightsBetween(r.checkIn, r.checkOut);
  res.json({ ...serializeReservation(r), cabin: r.cabin, nights, total: nights * r.cabin.price });
});

const statusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'cancelled']) });

reservationsRouter.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = parseBody(statusSchema, req.body);
  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.reservation.findUnique({ where: { id: String(req.params.id) } });
    if (!current) throw notFound('Reserva');
    if (status === 'confirmed') {
      await lockCabin(tx, current.cabinId);
      const conflict = await findConflict(tx, current.cabinId, current.checkIn, current.checkOut, current.id);
      if (conflict) {
        throw new HttpError(409, `Se cruza con la reserva confirmada de ${conflict.guestName}`, {
          conflictId: conflict.id,
        });
      }
    }
    return tx.reservation.update({ where: { id: current.id }, data: { status } });
  });
  const payload = serializeReservation(updated);
  broadcast('reservation.updated', payload);
  res.json(payload);
});

reservationsRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.reservation.delete({ where: { id: String(req.params.id) } });
  broadcast('reservation.deleted', { id: String(req.params.id) });
  res.status(204).end();
});
