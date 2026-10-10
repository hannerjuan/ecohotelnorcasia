import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Difficulty, ReservationStatus } from '../types';

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const money = (value: number) => cop.format(value);

// 'YYYY-MM-DD' <-> Date local (sin desfases de zona horaria).
export function toDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function toIso(date: Date) {
  return format(date, 'yyyy-MM-dd');
}
export function prettyDate(value: string | Date, pattern = "d 'de' MMM yyyy") {
  return format(typeof value === 'string' && value.length === 10 ? toDate(value) : new Date(value), pattern, { locale: es });
}
export function nights(checkIn: string, checkOut: string) {
  return Math.round((toDate(checkOut).getTime() - toDate(checkIn).getTime()) / 86_400_000);
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { facil: 'Fácil', moderada: 'Moderada', dificil: 'Difícil' };

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};
export const STATUS_STYLE: Record<ReservationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

export function imageOr(url: string | undefined, seed: string, w = 800, h = 600) {
  return url || `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
