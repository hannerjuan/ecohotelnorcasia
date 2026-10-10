import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, createAdmin, resetDb } from './helpers.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

describe('subida de imágenes', () => {
  beforeEach(resetDb);

  it('el admin sube una imagen y queda disponible', async () => {
    const agent = await createAdmin();
    const res = await agent.post('/api/uploads').attach('files', PNG, { filename: 'a.png', contentType: 'image/png' }).expect(201);
    expect(res.body.urls[0]).toMatch(/^\/uploads\/.+\.png$/);
    await request(app).get(res.body.urls[0]).expect(200);
  });

  it('rechaza archivos que no son imágenes y usuarios sin sesión', async () => {
    const agent = await createAdmin();
    await agent.post('/api/uploads').attach('files', Buffer.from('hola'), { filename: 'a.txt', contentType: 'text/plain' }).expect(400);
    await request(app).post('/api/uploads').attach('files', PNG, { filename: 'a.png', contentType: 'image/png' }).expect(401);
  });
});
