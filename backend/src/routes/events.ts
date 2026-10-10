import { Router } from 'express';
import { addClient } from '../lib/events.js';
import { requireAdmin } from '../middleware/auth.js';

// Notificaciones en tiempo real para el panel (nuevas reservas, cambios de estado).
export const eventsRouter = Router();

eventsRouter.get('/', requireAdmin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('event: ready\ndata: {}\n\n');
  addClient(res);
  const ping = setInterval(() => res.write(': ping\n\n'), 25_000);
  req.on('close', () => clearInterval(ping));
});
