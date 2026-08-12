require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { limpiarDB, cerrarPool } = require('./setup');
const bcrypt = require('bcrypt');
const pool = require('../src/db');

describe('Auth endpoints', () => {
  beforeEach(async () => {
    await limpiarDB();
  });

  afterAll(async () => {
    await cerrarPool();
  });

  test('POST /auth/registro — crea usuario y devuelve tokens', async () => {
    const res = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Test User', email: 'test@test.com', password: 'pass123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('id');
  });

  test('POST /auth/registro — rechaza email duplicado', async () => {
    await request(app)
      .post('/auth/registro')
      .send({ nombre: 'User 1', email: 'dup@test.com', password: 'pass123' });

    const res = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'User 2', email: 'dup@test.com', password: 'pass456' });

    expect(res.status).toBe(409);
  });

  test('POST /auth/login — credenciales correctas', async () => {
    await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Login Test', email: 'login@test.com', password: 'mipass' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'mipass' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.rol).toBe('cliente');
  });

  test('POST /auth/login — credenciales incorrectas devuelve 401', async () => {
    await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Fail Test', email: 'fail@test.com', password: 'correct' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'fail@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  test('ruta protegida sin token → 401', async () => {
    const res = await request(app).get('/citas/mias');
    expect(res.status).toBe(401);
  });

  test('ruta de admin con rol cliente → 403', async () => {
    const regRes = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'No Admin', email: 'noadmin@test.com', password: 'pass' });

    const token = regRes.body.accessToken;
    const res = await request(app)
      .get('/admin/agenda-general?fecha=2025-03-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// modified

// modified
