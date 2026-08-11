const pool = require('../db');

async function listar() {
  const [rows] = await pool.execute(`
    SELECT p.id, p.especialidad, p.hora_inicio_laboral, p.hora_fin_laboral,
           u.nombre, u.email
    FROM profesionales p
    JOIN usuarios u ON p.usuario_id = u.id
  `);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT p.id, p.usuario_id, p.especialidad, p.hora_inicio_laboral, p.hora_fin_laboral,
           u.nombre
    FROM profesionales p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = ?
  `, [id]);
  return rows[0] || null;
}

async function findByUsuarioId(usuarioId) {
  const [rows] = await pool.execute(
    'SELECT * FROM profesionales WHERE usuario_id = ?',
    [usuarioId]
  );
  return rows[0] || null;
}

async function crear(usuarioId, especialidad, horaInicio, horaFin) {
  const [result] = await pool.execute(
    'INSERT INTO profesionales (usuario_id, especialidad, hora_inicio_laboral, hora_fin_laboral) VALUES (?, ?, ?, ?)',
    [usuarioId, especialidad, horaInicio || '09:00:00', horaFin || '19:00:00']
  );
  return result.insertId;
}

module.exports = { listar, findById, findByUsuarioId, crear };
