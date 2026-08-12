const pool = require('../db');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function crear(nombre, email, passwordHash, rol = 'cliente') {
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, passwordHash, rol]
  );
  return result.insertId;
}

async function findEmpleadosSinPerfil() {
  const [rows] = await pool.execute(`
    SELECT u.id, u.nombre, u.email 
    FROM usuarios u
    LEFT JOIN profesionales p ON u.id = p.usuario_id
    WHERE u.rol = 'empleado' AND p.id IS NULL
  `);
  return rows;
}

module.exports = { findByEmail, findById, crear, findEmpleadosSinPerfil };


// modified

// modified
