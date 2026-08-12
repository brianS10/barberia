require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { limpiarDB, cerrarPool } = require('./setup');
const pool = require('../src/db');
const bcrypt = require('bcrypt');

jest.mock('../src/utils/email', () => ({
  enviarCorreo: jest.fn().mockResolvedValue()
}));


// Helpers para crear datos de prueba directamente en la DB
async function crearUsuario(nombre, email, rol = 'cliente') {
  const hash = await bcrypt.hash('pass123', 10);
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );
  return result.insertId;
}

async function crearProfesional(usuarioId) {
  const [result] = await pool.execute(
    "INSERT INTO profesionales (usuario_id, especialidad, hora_inicio_laboral, hora_fin_laboral) VALUES (?, 'Corte', '09:00:00', '17:00:00')",
    [usuarioId]
  );
  return result.insertId;
}

async function crearServicio() {
  const [result] = await pool.execute(
    "INSERT INTO servicios (nombre, duracion_min, precio) VALUES ('Corte', 30, 150)"
  );
  return result.insertId;
}

async function loginComo(email) {
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password: 'pass123' });
  return res.body.accessToken;
}

describe('Citas endpoints', () => {
  let clienteToken, profesionalId, servicioId;

  beforeEach(async () => {
    await limpiarDB();

    const clienteId = await crearUsuario('Cliente Test', 'cliente@test.com');
    const empId = await crearUsuario('Empleado Test', 'emp@test.com', 'empleado');
    profesionalId = await crearProfesional(empId);
    servicioId = await crearServicio();
    clienteToken = await loginComo('cliente@test.com');
  });

  afterAll(async () => {
    await cerrarPool();
  });

  test('POST /citas — agendar cita exitosamente', async () => {
    const res = await request(app)
      .post('/citas')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        profesional_id: profesionalId,
        servicio_id: servicioId,
        fecha_hora_inicio: '2025-06-20T10:00:00'
      });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('confirmada');
    expect(res.body).toHaveProperty('id');
  });

  test('POST /citas — rechaza horario ya ocupado con 409', async () => {
    // Primera cita
    await request(app)
      .post('/citas')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        profesional_id: profesionalId,
        servicio_id: servicioId,
        fecha_hora_inicio: '2025-06-20T10:00:00'
      });

    // Misma hora, mismo profesional
    const res = await request(app)
      .post('/citas')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        profesional_id: profesionalId,
        servicio_id: servicioId,
        fecha_hora_inicio: '2025-06-20T10:00:00'
      });

    expect(res.status).toBe(409);
  });

  test('POST /citas — rechaza si está fuera de jornada laboral', async () => {
    const res = await request(app)
      .post('/citas')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        profesional_id: profesionalId,
        servicio_id: servicioId,
        fecha_hora_inicio: '2025-06-20T07:00:00'
      });

    expect(res.status).toBe(400);
  });

  test('GET /citas/mias — lista citas del cliente autenticado', async () => {
    await request(app)
      .post('/citas')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        profesional_id: profesionalId,
        servicio_id: servicioId,
        fecha_hora_inicio: '2025-06-20T10:00:00'
      });

    const res = await request(app)
      .get('/citas/mias')
      .set('Authorization', `Bearer ${clienteToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].servicio).toBe('Corte');
  });

  test('PATCH /citas/:id/cancelar — cancelación normal (anticipación suficiente)', async () => {
    // Crear cita muy en el futuro para que la cancelación sea "a tiempo"
    const crear = await request(app)
      .post('/citas')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        profesional_id: profesionalId,
        servicio_id: servicioId,
        fecha_hora_inicio: '2030-12-20T10:00:00'
      });

    const res = await request(app)
      .patch(`/citas/${crear.body.id}/cancelar`)
      .set('Authorization', `Bearer ${clienteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('cancelada');
  });

  test('PATCH /citas/:id/cancelar — cancelación tardía', async () => {
    // Cita en el pasado o muy próxima → cancelación tardía
    const ahora = new Date();
    const enUnaHora = new Date(ahora.getTime() + 60 * 60 * 1000);
    const fechaStr = enUnaHora.toISOString().slice(0, 19);

    // Necesitamos forzar la inserción sin validar jornada,
    // así que insertamos directo en la DB
    const [result] = await pool.execute(
      "INSERT INTO citas (cliente_id, profesional_id, servicio_id, fecha_hora_inicio, fecha_hora_fin, estado) VALUES (1, ?, ?, ?, ?, 'confirmada')",
      [profesionalId, servicioId, fechaStr, fechaStr]
    );

    const res = await request(app)
      .patch(`/citas/${result.insertId}/cancelar`)
      .set('Authorization', `Bearer ${clienteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('cancelacion_tardia');
  });

  test('concurrencia — dos requests al mismo slot, solo uno gana', async () => {
    // Creamos un segundo cliente
    await crearUsuario('Cliente 2', 'cliente2@test.com');
    const token2 = await loginComo('cliente2@test.com');

    const payload = {
      profesional_id: profesionalId,
      servicio_id: servicioId,
      fecha_hora_inicio: '2025-06-20T12:00:00'
    };

    // Mandamos ambas peticiones en paralelo
    const [res1, res2] = await Promise.all([
      request(app).post('/citas').set('Authorization', `Bearer ${clienteToken}`).send(payload),
      request(app).post('/citas').set('Authorization', `Bearer ${token2}`).send(payload)
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);
  });
});

// modified
