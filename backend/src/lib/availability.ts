import type { Prisma, PrismaClient } from '@prisma/client';
import { formatDate, todayUtc } from './dates.js';

type Db = PrismaClient | Prisma.TransactionClient;

// Dos rangos [checkIn, checkOut) se cruzan si uno empieza antes de que termine el otro.
// El día de salida queda libre para que otro huésped llegue ese mismo día.
export async function findConflict(
  db: Db,
  cabinId: string,
  checkIn: Date,
  checkOut: Date,
  excludeId?: string,
) {
  return db.reservation.findFirst({
    where: {
      cabinId,
      status: 'confirmed',
      id: excludeId ? { not: excludeId } : undefined,
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    orderBy: { checkIn: 'asc' },
  });
}

// Rangos ocupados (solo reservas confirmadas y vigentes), sin datos personales.
export async function bookedRanges(db: Db, cabinId: string) {
  const rows = await db.reservation.findMany({
    where: { cabinId, status: 'confirmed', checkOut: { gte: todayUtc() } },
    select: { checkIn: true, checkOut: true },
    orderBy: { checkIn: 'asc' },
  });
  return rows.map((r) => ({ start: formatDate(r.checkIn), end: formatDate(r.checkOut) }));
}
