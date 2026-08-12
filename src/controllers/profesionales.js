const Profesional = require('../models/profesional');
const { calcularDisponibilidad } = require('../utils/disponibilidad');
const Servicio = require('../models/servicio');

async function listar(_req, res, next) {
  try {
    const profesionales = await Profesional.listar();
    res.json(profesionales);
  } catch (err) {
    next(err);
  }
}

async function disponibilidad(req, res, next) {
  try {
    const { id } = req.params;
    const { fecha, servicio_id } = req.query;

    if (!fecha || !servicio_id) {
      const err = new Error('Parámetros fecha y servicio_id son requeridos');
      err.status = 400;
      throw err;
    }

    const servicio = await Servicio.findById(servicio_id);
    if (!servicio) {
      const err = new Error('Servicio no encontrado');
      err.status = 404;
      throw err;
    }

    const slots = await calcularDisponibilidad(parseInt(id), fecha, servicio.duracion_min);
    res.json({ fecha, profesional_id: parseInt(id), servicio: servicio.nombre, slots });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, disponibilidad };

// modified

// modified

// modified

// modified
