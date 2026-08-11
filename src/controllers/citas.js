const pool = require('../db');
const Cita = require('../models/cita');
const Servicio = require('../models/servicio');
const Profesional = require('../models/profesional');
const Bloqueo = require('../models/bloqueo');
const Usuario = require('../models/usuario');
const { enviarCorreo } = require('../utils/email');

async function agendar(req, res, next) {
  const { profesional_id, servicio_id, fecha_hora_inicio } = req.body;

  if (!profesional_id || !servicio_id || !fecha_hora_inicio) {
    const err = new Error('profesional_id, servicio_id y fecha_hora_inicio son requeridos');
    err.status = 400;
    return next(err);
  }

  let connection;
  try {
    const servicio = await Servicio.findById(servicio_id);
    if (!servicio) {
      const err = new Error('Servicio no encontrado');
      err.status = 404;
      throw err;
    }

    const profesional = await Profesional.findById(profesional_id);
    if (!profesional) {
      const err = new Error('Profesional no encontrado');
      err.status = 404;
      throw err;
    }

    const inicio = new Date(fecha_hora_inicio);
    const fin = new Date(inicio.getTime() + servicio.duracion_min * 60000);

    // Validar que esté dentro del horario laboral
    const fecha = fecha_hora_inicio.split('T')[0];
    const jornadaInicio = new Date(`${fecha}T${profesional.hora_inicio_laboral}`);
    const jornadaFin = new Date(`${fecha}T${profesional.hora_fin_laboral}`);

    if (inicio < jornadaInicio || fin > jornadaFin) {
      const err = new Error('El horario solicitado está fuera de la jornada laboral del profesional');
      err.status = 400;
      throw err;
    }

    // --- Sección crítica: transacción con SELECT FOR UPDATE ---
    // Esto evita que dos clientes agenden el mismo slot si mandan la
    // petición casi simultánea. El FOR UPDATE bloquea las filas de citas
    // de este profesional en este rango hasta que hagamos COMMIT o ROLLBACK.
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const conflictos = await Cita.citasActivasEnRangoForUpdate(
      connection, profesional_id, inicio.toISOString(), fin.toISOString()
    );

    if (conflictos.length > 0) {
      await connection.rollback();
      const err = new Error('El horario ya está ocupado');
      err.status = 409;
      throw err;
    }

    // Verificar bloqueos también (no necesitan FOR UPDATE, los gestiona el empleado)
    const bloqueos = await Bloqueo.bloqueosDelDia(profesional_id, fecha);
    const hayBloqueo = bloqueos.some(b => {
      const bInicio = new Date(b.fecha_hora_inicio);
      const bFin = new Date(b.fecha_hora_fin);
      return inicio < bFin && fin > bInicio;
    });

    if (hayBloqueo) {
      await connection.rollback();
      const err = new Error('El profesional tiene un bloqueo en ese horario');
      err.status = 409;
      throw err;
    }

    const citaId = await Cita.crear(
      connection,
      req.usuario.id,
      profesional_id,
      servicio_id,
      inicio.toISOString(),
      fin.toISOString()
    );

    await connection.commit();

    // Notificación por email (fire and forget)
    const cliente = await Usuario.findById(req.usuario.id);
    enviarCorreo(
      cliente.email,
      'Cita confirmada — FreshCut',
      `Tu cita de ${servicio.nombre} con ${profesional.nombre} ha sido agendada para ${inicio.toLocaleString()}.`
    );

    res.status(201).json({
      id: citaId,
      fecha_hora_inicio: inicio,
      fecha_hora_fin: fin,
      estado: 'confirmada'
    });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (_) { /* ya hicimos rollback o no hay transacción */ }
    }
    next(err);
  } finally {
    if (connection) connection.release();
  }
}

async function misCitas(req, res, next) {
  try {
    const citas = await Cita.citasDelCliente(req.usuario.id);
    res.json(citas);
  } catch (err) {
    next(err);
  }
}

async function cancelar(req, res, next) {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) {
      const err = new Error('Cita no encontrada');
      err.status = 404;
      throw err;
    }

    if (cita.cliente_id !== req.usuario.id) {
      const err = new Error('No puedes cancelar una cita que no es tuya');
      err.status = 403;
      throw err;
    }

    if (cita.estado !== 'confirmada') {
      const err = new Error('Solo se pueden cancelar citas confirmadas');
      err.status = 400;
      throw err;
    }

    const ahora = new Date();
    const inicioCita = new Date(cita.fecha_hora_inicio);
    const horasDeAnticipacion = (inicioCita - ahora) / (1000 * 60 * 60);
    const threshold = parseInt(process.env.CANCEL_HOURS_THRESHOLD, 10) || 4;

    let nuevoEstado;
    if (horasDeAnticipacion >= threshold) {
      nuevoEstado = 'cancelada';
    } else {
      nuevoEstado = 'cancelacion_tardia';
    }

    await Cita.actualizarEstado(cita.id, nuevoEstado);

    // Notificar al cliente
    const cliente = await Usuario.findById(cita.cliente_id);
    const tipo = nuevoEstado === 'cancelada' ? 'Cancelación' : 'Cancelación tardía';
    enviarCorreo(
      cliente.email,
      `${tipo} de cita — FreshCut`,
      `Tu cita del ${inicioCita.toLocaleString()} ha sido marcada como "${nuevoEstado}".`
    );

    res.json({ id: cita.id, estado: nuevoEstado });
  } catch (err) {
    next(err);
  }
}

module.exports = { agendar, misCitas, cancelar };
