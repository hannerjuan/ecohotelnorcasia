// Datos iniciales: administrador, configuración y contenido de ejemplo.
// Es seguro ejecutarlo varias veces: solo crea contenido si las tablas están vacías.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_HERO_IMAGES } from '../src/lib/settings.js';

const prisma = new PrismaClient();

const img = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'ecohotelmadeguadua@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'CambiaEstaClave123';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: { email, name: process.env.ADMIN_NAME ?? 'Administrador', role: 'admin', passwordHash: await bcrypt.hash(password, 10) },
    });
    console.log(`Administrador creado: ${email}`);
  }

  await prisma.hotelSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, heroImages: DEFAULT_HERO_IMAGES },
  });

  if ((await prisma.cabin.count()) === 0) {
    const cabins = [
      {
        name: 'Cabaña Guadua del Río',
        description:
          'Cabaña construida en guadua y bambú a pocos pasos del Río La Miel. Despierta con el sonido del agua y el canto de las aves en una terraza privada con hamacas.',
        price: 280000,
        capacity: 4,
        amenities: ['Wifi', 'Café', 'Vista al Río', 'Baño privado', 'Hamacas'],
        imageUrl: img('photo-1587061949409-02df41d5e562'),
        galleryUrls: [img('photo-1510798831971-661eb04b3739'), img('photo-1449158743715-0a90ebb6d2d8'), img('photo-1520250497591-112f2f40a3f4')],
        latitude: 5.5816,
        longitude: -74.8903,
      },
      {
        name: 'Refugio del Bosque',
        description:
          'Un refugio íntimo para parejas rodeado de bosque tropical. Cama doble, ducha al aire libre y un balcón ideal para ver el atardecer.',
        price: 220000,
        capacity: 2,
        amenities: ['Wifi', 'Café', 'Vista a la Montaña', 'Ducha exterior'],
        imageUrl: img('photo-1499696010180-025ef6e1a8f9'),
        galleryUrls: [img('photo-1464146072230-91cabc968266'), img('photo-1475087542963-13ab5e611954')],
        latitude: 5.5753,
        longitude: -74.8983,
      },
      {
        name: 'Casa Familiar Madeguadua',
        description:
          'Amplia casa de dos niveles para familias o grupos, con cocina equipada, zona social y acceso directo a los senderos del hotel.',
        price: 450000,
        capacity: 8,
        amenities: ['Wifi', 'Cocina equipada', 'Aire Acondicionado', 'Parqueadero', 'Zona BBQ'],
        imageUrl: img('photo-1518780664697-55e3ad937233'),
        galleryUrls: [img('photo-1505691938895-1758d7feb511'), img('photo-1522708323590-d24dbb6b0267')],
        latitude: 5.5826,
        longitude: -74.8993,
      },
    ];
    for (const data of cabins) await prisma.cabin.create({ data });
    console.log(`${cabins.length} cabañas de ejemplo creadas`);
  }

  if ((await prisma.activity.count()) === 0) {
    await prisma.activity.createMany({
      data: [
        {
          name: 'Recorrido en lancha por el Río La Miel',
          description: 'Navega las aguas cristalinas del río y descubre sus playas escondidas.',
          details: 'Recorrido guiado en lancha con paradas para nadar en pozos naturales. Incluye chaleco salvavidas y guía local.',
          cost: 60000,
          duration: '3 horas',
          difficulty: 'facil',
          imageUrl: img('photo-1544551763-46a013bb70d5', 900),
          includes: ['Guía local', 'Chaleco salvavidas', 'Hidratación'],
        },
        {
          name: 'Caminata a las cascadas',
          description: 'Sendero ecológico entre el bosque hasta las cascadas de la vereda.',
          details: 'Caminata de dificultad media por senderos de bosque húmedo tropical, con observación de aves y baño en cascadas.',
          cost: 40000,
          duration: '4 horas',
          difficulty: 'moderada',
          imageUrl: img('photo-1432405972618-c60b0225b8f9', 900),
          includes: ['Guía', 'Refrigerio'],
        },
        {
          name: 'Pesca artesanal',
          description: 'Aprende las técnicas de pesca de los pescadores de Norcasia.',
          details: 'Jornada de pesca con pescadores locales. Lo que pesques lo preparamos en el restaurante.',
          cost: 50000,
          duration: '2 horas',
          difficulty: 'facil',
          imageUrl: img('photo-1500463959177-e0869687df26', 900),
          includes: ['Equipo de pesca', 'Preparación de la pesca'],
        },
        {
          name: 'Observación de aves al amanecer',
          description: 'Más de 200 especies de aves habitan la región del Magdalena Medio.',
          details: 'Salida temprana con binoculares y guía especializado para observar aves en su hábitat natural.',
          cost: 0,
          duration: '2 horas',
          difficulty: 'facil',
          imageUrl: img('photo-1444464666168-49d633b86797', 900),
          includes: ['Binoculares', 'Café de origen'],
        },
      ],
    });
    console.log('Actividades de ejemplo creadas');
  }

  if ((await prisma.menuItem.count()) === 0) {
    await prisma.menuItem.createMany({
      data: [
        { category: 'Desayunos', name: 'Desayuno campesino', description: 'Arepa, huevos al gusto, queso fresco, fruta y café de origen.', price: 22000, sortOrder: 1 },
        { category: 'Desayunos', name: 'Bowl tropical', description: 'Frutas de temporada, yogur natural, granola y miel de la región.', price: 18000, sortOrder: 2 },
        { category: 'Platos fuertes', name: 'Bocachico frito', description: 'Pescado del río con patacón, arroz de coco y ensalada.', price: 38000, sortOrder: 1 },
        { category: 'Platos fuertes', name: 'Sancocho de gallina', description: 'Receta tradicional cocinada a leña.', price: 32000, sortOrder: 2 },
        { category: 'Platos fuertes', name: 'Menú degustación', description: 'Cinco tiempos por los sabores del Magdalena Medio.', price: 95000, sortOrder: 3 },
        { category: 'Bebidas', name: 'Café de origen', description: 'Tostado en casa, preparado en método de tu preferencia.', price: 7000, sortOrder: 1 },
        { category: 'Bebidas', name: 'Jugo natural', description: 'Frutas frescas de la huerta en agua o leche.', price: 9000, sortOrder: 2 },
      ],
    });
    console.log('Menú de ejemplo creado');
  }

  if ((await prisma.review.count()) === 0) {
    const [first, second, third] = await prisma.cabin.findMany({ orderBy: { createdAt: 'asc' }, take: 3 });
    if (first && second && third) {
      await prisma.review.createMany({
        data: [
          { cabinId: first.id, guestName: 'Camila Ruiz', rating: 5, featured: true, comment: 'El diseño de las cabañas de guadua es espectacular. Despertar con el sonido de los pájaros y tener el Río La Miel ahí mismo fue una experiencia de otro nivel.' },
          { cabinId: second.id, guestName: 'Fernando y Laura', rating: 5, featured: true, comment: 'La atención al detalle en este hotel es increíble. La comida del restaurante nos sorprendió gratamente. Definitivamente volveremos para nuestro aniversario.' },
          { cabinId: third.id, guestName: 'Santiago H.', rating: 5, featured: true, comment: 'El tour por el río y las cascadas estuvo muy bien organizado. Las instalaciones se sienten muy orgánicas con el entorno. Un escape perfecto.' },
        ],
      });
      console.log('Reseñas de ejemplo creadas');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
