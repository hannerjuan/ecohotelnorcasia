import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, createAdmin, createCabin, resetDb } from './helpers.js';

const cabin = { name: 'Nueva', description: 'Bonita', price: 150000, capacity: 3, amenities: ['Wifi'], imageUrl: '/uploads/x.jpg' };

describe('cabañas, actividades y menú', () => {
  beforeEach(resetDb);

  it('CRUD de cabañas por el admin y lectura pública', async () => {
    const agent = await createAdmin();
    const created = await agent.post('/api/cabins').send(cabin).expect(201);
    await agent.put(`/api/cabins/${created.body.id}`).send({ ...cabin, price: 180000 }).expect(200);
    const pub = await request(app).get(`/api/cabins/${created.body.id}`).expect(200);
    expect(pub.body).toMatchObject({ price: 180000, averageRating: null, reviewCount: 0 });
    await agent.delete(`/api/cabins/${created.body.id}`).expect(204);
    await request(app).get(`/api/cabins/${created.body.id}`).expect(404);
  });

  it('valida los datos de la cabaña', async () => {
    const agent = await createAdmin();
    const res = await agent.post('/api/cabins').send({ ...cabin, price: -5, imageUrl: 'javascript:alert(1)' }).expect(400);
    expect(res.body.details).toHaveProperty('price');
    expect(res.body.details).toHaveProperty('imageUrl');
  });

  it('reseñas: crea, calcula promedio y destaca testimonios', async () => {
    const c = await createCabin();
    await request(app).post(`/api/cabins/${c.id}/reviews`).send({ guestName: 'Ana', rating: 5, comment: 'Excelente' }).expect(201);
    await request(app).post(`/api/cabins/${c.id}/reviews`).send({ guestName: 'Luis', rating: 3, comment: 'Bien' }).expect(201);
    await request(app).post(`/api/cabins/${c.id}/reviews`).send({ guestName: 'X', rating: 9, comment: 'x' }).expect(400);
    const detail = await request(app).get(`/api/cabins/${c.id}`).expect(200);
    expect(detail.body).toMatchObject({ averageRating: 4, reviewCount: 2 });

    const featured = await request(app).get('/api/reviews/featured').expect(200);
    expect(featured.body.map((r: { guestName: string }) => r.guestName)).toEqual(['Ana']);

    const agent = await createAdmin();
    const all = await agent.get('/api/reviews').expect(200);
    const luis = all.body.find((r: { guestName: string }) => r.guestName === 'Luis');
    await agent.patch(`/api/reviews/${luis.id}`).send({ featured: true }).expect(200);
    const after = await request(app).get('/api/reviews/featured').expect(200);
    expect(after.body.map((r: { guestName: string }) => r.guestName)).toEqual(['Luis']);
  });

  it('actividades y menú', async () => {
    const agent = await createAdmin();
    await agent
      .post('/api/activities')
      .send({ name: 'Lancha', description: 'Paseo', details: 'Detalle', cost: 0, difficulty: 'facil', includes: ['Guía'] })
      .expect(201);
    expect((await request(app).get('/api/activities')).body).toHaveLength(1);

    await agent.post('/api/menu').send({ name: 'Café', category: 'Bebidas', price: 5000 }).expect(201);
    await agent.post('/api/menu').send({ name: 'Agotado', category: 'Bebidas', price: 5000, available: false }).expect(201);
    expect((await request(app).get('/api/menu')).body).toHaveLength(1);
    expect((await agent.get('/api/menu?all=true')).body).toHaveLength(2);
  });

  it('configuración del hotel', async () => {
    const pub = await request(app).get('/api/settings').expect(200);
    expect(pub.body.whatsappNumber).toBeTruthy();
    const agent = await createAdmin();
    const res = await agent
      .put('/api/settings')
      .send({ ...pub.body, whatsappNumber: '+57 310 123 4567' })
      .expect(200);
    expect(res.body.whatsappNumber).toBe('573101234567');
  });
});
