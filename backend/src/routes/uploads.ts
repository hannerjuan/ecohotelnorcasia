import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { config } from '../config.js';
import { HttpError } from '../lib/errors.js';
import { requireAdmin } from '../middleware/auth.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, 'Solo se permiten imágenes JPG, PNG, WEBP, GIF o AVIF'));
  },
});

export const uploadsRouter = Router();

uploadsRouter.post('/', requireAdmin, upload.array('files', 10), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new HttpError(400, 'No se recibió ninguna imagen');
  res.status(201).json({ urls: files.map((f) => `/uploads/${path.basename(f.path)}`) });
});
