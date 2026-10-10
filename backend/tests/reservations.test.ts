import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, createAdmin, createCabin, futureDate, resetDb } from './helpers.js';

const booking = (cabinId: string, checkIn: string, checkOut: string, extra: Record<string, unknown> = {}) => ({
  cabinId,
  guestName: 'Huésped',
  checkIn,
  checkOut,
  guests: 2,
  whatsappNumber: '+57 300 123 4567',
  acceptPrivacy: true,
  ...extra,
});

describe('reservas', () => {
  beforeEach(resetDb);

  it('crea una solicitud pendiente con enlace de WhatsApp y total', async () => {
    const cabin = await createCabin();
    const res = await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(10), futureDate(13))).expect(201);
    expect(res.body.reservation.status).toBe('pending');
    expect(res.body.nights).toBe(3);
    expect(res.body.total).toBe(300000);
    expect(res.body.whatsappUrl).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });

  it('exige aceptar la política de datos y fechas coherentes', async () => {
    const cabin = await createCabin();
    await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(5), futureDate(7), { acceptPrivacy: false })).expect(400);
    await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(7), futureDate(5))).expect(400);
    await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(-3), futureDate(2))).expect(400);
    await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(5), futureDate(7), { guests: 9 })).expect(400);
  });

  it('bloquea fechas ocupadas por reservas confirmadas', async () => {
    const cabin = await createCabin();
    const agent = await createAdmin();
    const first = await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(10), futureDate(13))).expect(201);
    // Mientras está pendiente, otro huésped puede pedir las mismas fechas.
    const second = await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(11), futureDate(12))).expect(201);

    await agent.patch(`/api/reservations/${first.body.reservation.id}/status`).send({ status: 'confirmed' }).expect(200);

    const availability = await request(app).get(`/api/cabins/${cabin.id}/availability`).expect(200);
    expect(availability.body.booked).toEqual([{ start: futureDate(10), end: futureDate(13) }]);

    // Ya no se puede pedir ni confirmar algo que se cruce.
    const conflict = await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(12), futureDate(14))).expect(409);
    expect(conflict.body.details.availableFrom).toBe(futureDate(13));
    await agent.patch(`/api/reservations/${second.body.reservation.id}/status`).send({ status: 'confirmed' }).expect(409);

    // El día de salida queda libre para una nueva llegada.
    await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(13), futureDate(15))).expect(201);
  });

  it('el admin filtra, ve el detalle, exporta CSV y elimina', async () => {
    const cabin = await createCabin({ name: 'Río' });
    const agent = await createAdmin();
    const a = await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(3), futureDate(5), { guestName: 'María Pérez' }));
    await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(20), futureDate(22), { guestName: 'Juan' }));

    expect((await agent.get('/api/reservations').expect(200)).body).toHaveLength(2);
    expect((await agent.get('/api/reservations?q=maría').expect(200)).body).toHaveLength(1);
    expect((await agent.get(`/api/reservations?from=${futureDate(15)}`).expect(200)).body).toHaveLength(1);
    expect((await agent.get('/api/reservations?status=confirmed').expect(200)).body).toHaveLength(0);

    const detail = await agent.get(`/api/reservations/${a.body.reservation.id}`).expect(200);
    expect(detail.body).toMatchObject({ nights: 2, total: 200000 });

    const csv = await agent.get('/api/reservations/export.csv').expect(200);
    expect(csv.headers['content-type']).toContain('text/csv');
    expect(csv.text).toContain('María Pérez');
    expect(csv.text.trim().split('\n')).toHaveLength(3);

    await agent.delete(`/api/reservations/${a.body.reservation.id}`).expect(204);
    expect((await agent.get('/api/reservations')).body).toHaveLength(1);
  });

  it('no expone datos personales de las reservas al público', async () => {
    const cabin = await createCabin();
    await request(app).post('/api/reservations').send(booking(cabin.id, futureDate(3), futureDate(5)));
    await request(app).get('/api/reservations').expect(401);
    const availability = await request(app).get(`/api/cabins/${cabin.id}/availability`);
    expect(JSON.stringify(availability.body)).not.toContain('300');
  });

  it('busca cabañas disponibles por fechas y personas', async () => {
    const big = await createCabin({ name: 'Grande', capacity: 6 });
    const small = await createCabin({ name: 'Pequeña', capacity: 2 });
    const agent = await createAdmin();
    const r = await request(app).post('/api/reservations').send(booking(big.id, futureDate(10), futureDate(12)));
    await agent.patch(`/api/reservations/${r.body.reservation.id}/status`).send({ status: 'confirmed' }).expect(200);

    const res = await request(app).get(`/api/cabins?checkIn=${futureDate(11)}&checkOut=${futureDate(13)}&guests=2`).expect(200);
    const byName = Object.fromEntries(res.body.map((c: { name: string; available: boolean }) => [c.name, c.available]));
    expect(byName).toEqual({ Grande: false, Pequeña: true });

    const forFour = await request(app).get('/api/cabins?guests=4').expect(200);
    expect(forFour.body.map((c: { name: string }) => c.name)).toEqual(['Grande']);
    expect(small.id).toBeTruthy();
  });
});
