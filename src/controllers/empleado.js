const Cita = require('../models/cita');
const Bloqueo = require('../models/bloqueo');
const Profesional = require('../models/profesional');

async function miAgenda(req, res, next) {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      const err = new Error('Parámetro fecha es requerido');
      err.status = 400;
      throw err;
    }

    const profesional = await Profesional.findByUsuarioId(req.usuario.id);
    if (!profesional) {
      const err = new Error('Tu usuario no tiene perfil de profesional');
      err.status = 403;
      throw err;
    }

    const citas = await Cita.citasDelDia(profesional.id, fecha);
    const bloqueos = await Bloqueo.bloqueosDelDia(profesional.id, fecha);

    res.json({ fecha, citas, bloqueos });
  } catch (err) {
    next(err);
  }
}

async function crearBloqueo(req, res, next) {
  try {
    const { fecha_hora_inicio, fecha_hora_fin, motivo } = req.body;

    if (!fecha_hora_inicio || !fecha_hora_fin) {
      const err = new Error('fecha_hora_inicio y fecha_hora_fin son requeridos');
      err.status = 400;
      throw err;
    }

    const profesional = await Profesional.findByUsuarioId(req.usuario.id);
    if (!profesional) {
      const err = new Error('Tu usuario no tiene perfil de profesional');
      err.status = 403;
      throw err;
    }

    const id = await Bloqueo.crear(profesional.id, fecha_hora_inicio, fecha_hora_fin, motivo || null);
    res.status(201).json({ id, fecha_hora_inicio, fecha_hora_fin, motivo });
  } catch (err) {
    next(err);
  }
}

async function eliminarBloqueo(req, res, next) {
  try {
    const bloqueo = await Bloqueo.findById(req.params.id);
    if (!bloqueo) {
      const err = new Error('Bloqueo no encontrado');
      err.status = 404;
      throw err;
    }

    // Solo puede borrar sus propios bloqueos
    const profesional = await Profesional.findByUsuarioId(req.usuario.id);
    if (!profesional || bloqueo.profesional_id !== profesional.id) {
      const err = new Error('No puedes eliminar bloqueos de otro profesional');
      err.status = 403;
      throw err;
    }

    await Bloqueo.eliminar(bloqueo.id);
    res.json({ mensaje: 'Bloqueo eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { miAgenda, crearBloqueo, eliminarBloqueo };

// modified

// modified
