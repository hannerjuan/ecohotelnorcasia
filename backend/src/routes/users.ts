import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../lib/errors.js';
import { requireAdmin } from '../middleware/auth.js';
import { parseBody } from '../middleware/validate.js';

// Gestión de administradores desde el panel.
export const usersRouter = Router();
usersRouter.use(requireAdmin);

const select = { id: true, email: true, name: true, role: true, createdAt: true } as const;

usersRouter.get('/', async (_req, res) => {
  res.json(await prisma.user.findMany({ select, orderBy: { createdAt: 'asc' } }));
});

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo inválido'),
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['admin', 'guest']).default('admin'),
});

usersRouter.post('/', async (req, res) => {
  const data = parseBody(createSchema, req.body);
  const user = await prisma.user.create({
    data: { email: data.email, name: data.name, role: data.role, passwordHash: await bcrypt.hash(data.password, 10) },
    select,
  });
  res.status(201).json(user);
});

usersRouter.delete('/:id', async (req, res) => {
  if (String(req.params.id) === req.user!.id) throw new HttpError(400, 'No puedes eliminar tu propio usuario');
  await prisma.user.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
