const pool = require('../db');

async function bloqueosDelDia(profesionalId, fecha) {
  const [rows] = await pool.execute(`
    SELECT * FROM bloqueos_horario
    WHERE profesional_id = ?
      AND DATE(fecha_hora_inicio) = ?
    ORDER BY fecha_hora_inicio
  `, [profesionalId, fecha]);
  return rows;
}

async function crear(profesionalId, inicio, fin, motivo) {
  const [result] = await pool.execute(
    'INSERT INTO bloqueos_horario (profesional_id, fecha_hora_inicio, fecha_hora_fin, motivo) VALUES (?, ?, ?, ?)',
    [profesionalId, inicio, fin, motivo]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM bloqueos_horario WHERE id = ?', [id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  await pool.execute('DELETE FROM bloqueos_horario WHERE id = ?', [id]);
}

module.exports = { bloqueosDelDia, crear, findById, eliminar };

// modified
