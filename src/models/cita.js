const pool = require('../db');

async function citasActivasEnRango(profesionalId, inicio, fin) {
  const [rows] = await pool.execute(`
    SELECT id, fecha_hora_inicio, fecha_hora_fin
    FROM citas
    WHERE profesional_id = ?
      AND estado = 'confirmada'
      AND fecha_hora_inicio < ?
      AND fecha_hora_fin > ?
  `, [profesionalId, fin, inicio]);
  return rows;
}

// Versión con lock para usar dentro de una transacción
async function citasActivasEnRangoForUpdate(connection, profesionalId, inicio, fin) {
  const [rows] = await connection.execute(`
    SELECT id, fecha_hora_inicio, fecha_hora_fin
    FROM citas
    WHERE profesional_id = ?
      AND estado = 'confirmada'
      AND fecha_hora_inicio < ?
      AND fecha_hora_fin > ?
    FOR UPDATE
  `, [profesionalId, fin, inicio]);
  return rows;
}

async function citasDelDia(profesionalId, fecha) {
  const [rows] = await pool.execute(`
    SELECT c.id, c.fecha_hora_inicio, c.fecha_hora_fin, c.estado,
           s.nombre AS servicio, u.nombre AS cliente
    FROM citas c
    JOIN servicios s ON c.servicio_id = s.id
    JOIN usuarios u ON c.cliente_id = u.id
    WHERE c.profesional_id = ?
      AND DATE(c.fecha_hora_inicio) = ?
    ORDER BY c.fecha_hora_inicio
  `, [profesionalId, fecha]);
  return rows;
}

async function citasDelCliente(clienteId) {
  const [rows] = await pool.execute(`
    SELECT c.id, c.fecha_hora_inicio, c.fecha_hora_fin, c.estado,
           s.nombre AS servicio, u.nombre AS profesional
    FROM citas c
    JOIN servicios s ON c.servicio_id = s.id
    JOIN profesionales p ON c.profesional_id = p.id
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE c.cliente_id = ?
    ORDER BY c.fecha_hora_inicio DESC
  `, [clienteId]);
  return rows;
}

async function crear(connection, clienteId, profesionalId, servicioId, inicio, fin) {
  const [result] = await connection.execute(
    'INSERT INTO citas (cliente_id, profesional_id, servicio_id, fecha_hora_inicio, fecha_hora_fin) VALUES (?, ?, ?, ?, ?)',
    [clienteId, profesionalId, servicioId, inicio, fin]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM citas WHERE id = ?', [id]);
  return rows[0] || null;
}

async function actualizarEstado(id, estado) {
  await pool.execute('UPDATE citas SET estado = ? WHERE id = ?', [estado, id]);
}

async function agendaGeneral(fecha) {
  const [rows] = await pool.execute(`
    SELECT c.id, c.fecha_hora_inicio, c.fecha_hora_fin, c.estado,
           s.nombre AS servicio, 
           cli.nombre AS cliente,
           prof.nombre AS profesional
    FROM citas c
    JOIN servicios s ON c.servicio_id = s.id
    JOIN usuarios cli ON c.cliente_id = cli.id
    JOIN profesionales p ON c.profesional_id = p.id
    JOIN usuarios prof ON p.usuario_id = prof.id
    WHERE DATE(c.fecha_hora_inicio) = ?
    ORDER BY prof.nombre, c.fecha_hora_inicio
  `, [fecha]);
  return rows;
}

module.exports = {
  citasActivasEnRango,
  citasActivasEnRangoForUpdate,
  citasDelDia,
  citasDelCliente,
  crear,
  findById,
  actualizarEstado,
  agendaGeneral
};

// modified

// modified

// modified

// modified
