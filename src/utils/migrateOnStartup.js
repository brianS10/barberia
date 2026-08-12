const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

async function ensureDatabaseSchema() {
  console.log('Verificando base de datos...');
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Verificar si la tabla usuarios ya existe
    const [rows] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'usuarios'
    `, [process.env.DB_NAME]);

    const tableExists = rows[0] && rows[0].count > 0;

    if (!tableExists) {
      console.log('La tabla "usuarios" no existe. Iniciando migraciones...');
      
      // Ejecutar migraciones
      const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        console.log(`  → Ejecutando migración: ${file}`);
        await connection.query(sql);
      }
      console.log('Migraciones completadas.');

      // Ejecutar seed
      console.log('Ejecutando seed de datos iniciales...');
      const seedPath = path.join(__dirname, '..', '..', 'seeds', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        let sql = fs.readFileSync(seedPath, 'utf-8');
        const defaultHash = await bcrypt.hash('password123', 10);
        const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
        sql = sql.replace(/\$ADMIN_HASH\$/g, adminHash);
        sql = sql.replace(/\$HASH\$/g, defaultHash);
        await connection.query(sql);
        console.log('Seed completado.');
      }
    } else {
      console.log('La base de datos ya está inicializada.');
    }
  } catch (err) {
    console.error('Error al verificar/migrar la base de datos:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = { ensureDatabaseSchema };

// modified

// modified

// modified
