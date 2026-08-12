const pool = require('../src/db');

// Limpia las tablas entre tests (en orden por FKs)
async function limpiarDB() {
  await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
  await pool.execute('TRUNCATE TABLE citas');
  await pool.execute('TRUNCATE TABLE bloqueos_horario');
  await pool.execute('TRUNCATE TABLE profesionales');
  await pool.execute('TRUNCATE TABLE servicios');
  await pool.execute('TRUNCATE TABLE usuarios');
  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
}

async function cerrarPool() {
  await pool.end();
}

module.exports = { limpiarDB, cerrarPool };

// modified

// modified

// modified

// modified

// modified
