import type { Reservation } from '@prisma/client';
import { formatDate } from './dates.js';

export function serializeReservation(r: Reservation) {
  return { ...r, checkIn: formatDate(r.checkIn), checkOut: formatDate(r.checkOut) };
}
