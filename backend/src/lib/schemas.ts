import { z } from 'zod';

// Imagen: URL absoluta (http/https) o ruta de una imagen subida al servidor (/uploads/...).
export const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === '' || /^https?:\/\//.test(v) || v.startsWith('/uploads/'), 'URL de imagen inválida');

export const stringList = z.array(z.string().trim().min(1).max(200)).max(50);

export const cabinSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().trim().min(1, 'La descripción es obligatoria').max(5000),
  price: z.coerce.number().int().positive('El precio debe ser mayor a 0'),
  capacity: z.coerce.number().int().positive('La capacidad debe ser mayor a 0').max(50),
  amenities: stringList.default([]),
  imageUrl: imageUrl.default(''),
  galleryUrls: z.array(imageUrl).max(30).default([]),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  featured: z.boolean().default(true),
});

export const activitySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().trim().min(1, 'La descripción es obligatoria').max(500),
  details: z.string().trim().min(1, 'Los detalles son obligatorios').max(5000),
  cost: z.coerce.number().int().min(0).default(0),
  duration: z.string().trim().max(50).default(''),
  difficulty: z.enum(['facil', 'moderada', 'dificil']).default('facil'),
  imageUrl: imageUrl.default(''),
  galleryUrls: z.array(imageUrl).max(30).default([]),
  includes: stringList.default([]),
});

export const menuItemSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().trim().max(500).default(''),
  category: z.string().trim().min(1, 'La categoría es obligatoria').max(60),
  price: z.coerce.number().int().min(0),
  available: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});
