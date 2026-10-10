import { execSync } from 'node:child_process';

// Aplica las migraciones pendientes a la base de datos de pruebas (las pruebas limpian sus propias tablas).
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/ecohotel_test?schema=public';
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: url } });
}
