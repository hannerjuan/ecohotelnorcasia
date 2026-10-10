import { prisma } from '../db.js';

export const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1544253915-0810168cb729?auto=format&fit=crop&w=1920&q=80',
];

export async function getSettings() {
  return prisma.hotelSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, heroImages: DEFAULT_HERO_IMAGES },
  });
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
