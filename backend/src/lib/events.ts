import type { Response } from 'express';

// Canal de eventos en tiempo real (Server-Sent Events) para el panel de administración.
const clients = new Set<Response>();

export function addClient(res: Response) {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

export function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(payload);
}

export function clientCount() {
  return clients.size;
}
