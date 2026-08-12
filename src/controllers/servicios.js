const Servicio = require('../models/servicio');

async function listar(_req, res, next) {
  try {
    const servicios = await Servicio.listar();
    res.json(servicios);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };

// modified

// modified
