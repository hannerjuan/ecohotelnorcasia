// Las fechas de reserva viajan como 'YYYY-MM-DD' y se guardan como DATE (medianoche UTC).

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayUtc(): Date {
  return parseDate(new Date().toISOString().slice(0, 10));
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
}
