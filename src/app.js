const express = require('express');
const authRoutes = require('./routes/auth');
const profesionalesRoutes = require('./routes/profesionales');
const serviciosRoutes = require('./routes/servicios');
const citasRoutes = require('./routes/citas');
const empleadoRoutes = require('./routes/empleado');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/debug-db', async (req, res) => {
  try {
    const pool = require('./db');
    const [rows] = await pool.query('SHOW TABLES;');
    res.json({
      status: 'connected',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      tables: rows
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack
    });
  }
});

// Root-prefixed routes for compatibility with tests and direct calls
app.use('/auth', authRoutes);
app.use('/profesionales', profesionalesRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/citas', citasRoutes);
app.use('/empleado', empleadoRoutes);
app.use('/admin', adminRoutes);

// API-prefixed routes for Vercel env var API_URL support
app.use('/api/auth', authRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/empleado', empleadoRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;


// modified

// modified

// modified

// modified
