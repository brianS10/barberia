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

app.use('/auth', authRoutes);
app.use('/profesionales', profesionalesRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/citas', citasRoutes);
app.use('/empleado', empleadoRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
