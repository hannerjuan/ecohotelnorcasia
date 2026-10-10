import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

export const app = createApp();

export async function resetDb() {
  await prisma.$transaction([
    prisma.reservation.deleteMany(),
    prisma.review.deleteMany(),
    prisma.cabin.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.user.deleteMany(),
    prisma.hotelSettings.deleteMany(),
  ]);
}

export async function createAdmin(email = 'admin@test.co', password = 'Secreta123') {
  await prisma.user.create({
    data: { email, name: 'Admin', role: 'admin', passwordHash: await bcrypt.hash(password, 4) },
  });
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

export async function createCabin(overrides: Record<string, unknown> = {}) {
  return prisma.cabin.create({
    data: { name: 'Cabaña Test', description: 'Desc', price: 100000, capacity: 4, amenities: [], galleryUrls: [], ...overrides },
  });
}

export function futureDate(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
