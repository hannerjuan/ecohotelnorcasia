import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, createAdmin, resetDb } from './helpers.js';

describe('autenticación', () => {
  beforeEach(resetDb);

  it('rechaza credenciales incorrectas', async () => {
    await createAdmin();
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.co', password: 'mala' });
    expect(res.status).toBe(401);
  });

  it('inicia sesión, devuelve el usuario y cierra sesión', async () => {
    const agent = await createAdmin();
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.user).toMatchObject({ email: 'admin@test.co', role: 'admin' });
    await agent.post('/api/auth/logout').expect(200);
  });

  it('protege las rutas de administración', async () => {
    await request(app).post('/api/cabins').send({}).expect(401);
    await request(app).get('/api/reservations').expect(401);
    await request(app).get('/api/users').expect(401);
  });

  it('permite cambiar la contraseña', async () => {
    const agent = await createAdmin();
    await agent.patch('/api/auth/password').send({ currentPassword: 'Secreta123', newPassword: 'NuevaClave456' }).expect(200);
    await request(app).post('/api/auth/login').send({ email: 'admin@test.co', password: 'NuevaClave456' }).expect(200);
  });

  it('el admin puede crear otros administradores', async () => {
    const agent = await createAdmin();
    await agent.post('/api/users').send({ email: 'otro@test.co', name: 'Otro', password: 'OtraClave123' }).expect(201);
    const list = await agent.get('/api/users').expect(200);
    expect(list.body).toHaveLength(2);
  });
});
