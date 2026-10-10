import 'dotenv/config';
import path from 'node:path';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required('JWT_SECRET', isProduction ? undefined : 'dev-secret-no-usar-en-produccion'),
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? './uploads'),
  corsOrigin: process.env.CORS_ORIGIN || '',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  sessionDays: 7,
};
