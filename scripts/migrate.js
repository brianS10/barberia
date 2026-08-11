const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
};

async function runMigrations(connection) {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`  → ${file}`);
    await connection.query(sql);
  }
}

async function runSeed(connection) {
  const seedPath = path.join(__dirname, '..', 'seeds', 'seed.sql');
  let sql = fs.readFileSync(seedPath, 'utf-8');

  // Genera hashes reales para los datos de prueba
  const defaultHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

  sql = sql.replace(/\$ADMIN_HASH\$/g, adminHash);
  sql = sql.replace(/\$HASH\$/g, defaultHash);

  console.log('  → seed.sql');
  await connection.query(sql);
}

async function main() {
  const args = process.argv.slice(2);
  const shouldSeed = args.includes('--seed');

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('Running migrations...');
    await runMigrations(connection);
    console.log('Migrations complete.');

    if (shouldSeed) {
      console.log('Running seed...');
      await runSeed(connection);
      console.log('Seed complete.');
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

main();
