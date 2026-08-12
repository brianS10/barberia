const pool = require('../db');

async function listar() {
  const [rows] = await pool.execute('SELECT * FROM servicios');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM servicios WHERE id = ?', [id]);
  return rows[0] || null;
}

async function crear(nombre, duracionMin, precio) {
  const [result] = await pool.execute(
    'INSERT INTO servicios (nombre, duracion_min, precio) VALUES (?, ?, ?)',
    [nombre, duracionMin, precio]
  );
  return result.insertId;
}

module.exports = { listar, findById, crear };

// modified

// modified
