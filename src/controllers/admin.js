const Cita = require('../models/cita');
const Servicio = require('../models/servicio');
const Profesional = require('../models/profesional');
const Usuario = require('../models/usuario');

async function agendaGeneral(req, res, next) {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      const err = new Error('Parámetro fecha es requerido');
      err.status = 400;
      throw err;
    }

    const citas = await Cita.agendaGeneral(fecha);
    res.json({ fecha, citas });
  } catch (err) {
    next(err);
  }
}

async function crearServicio(req, res, next) {
  try {
    const { nombre, duracion_min, precio } = req.body;
    if (!nombre || !duracion_min || precio === undefined) {
      const err = new Error('nombre, duracion_min y precio son requeridos');
      err.status = 400;
      throw err;
    }

    const id = await Servicio.crear(nombre, duracion_min, precio);
    res.status(201).json({ id, nombre, duracion_min, precio });
  } catch (err) {
    next(err);
  }
}

async function crearProfesional(req, res, next) {
  try {
    const { usuario_id, especialidad, hora_inicio_laboral, hora_fin_laboral } = req.body;
    if (!usuario_id) {
      const err = new Error('usuario_id es requerido');
      err.status = 400;
      throw err;
    }

    // Verificar que el usuario existe y tiene rol empleado
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }
    if (usuario.rol !== 'empleado') {
      const err = new Error('El usuario debe tener rol de empleado');
      err.status = 400;
      throw err;
    }

    const existente = await Profesional.findByUsuarioId(usuario_id);
    if (existente) {
      const err = new Error('Este usuario ya tiene perfil de profesional');
      err.status = 409;
      throw err;
    }

    const id = await Profesional.crear(usuario_id, especialidad, hora_inicio_laboral, hora_fin_laboral);
    res.status(201).json({ id, usuario_id, especialidad });
  } catch (err) {
    next(err);
  }
}

async function listarEmpleadosSinPerfil(req, res, next) {
  try {
    const empleados = await Usuario.findEmpleadosSinPerfil();
    res.json(empleados);
  } catch (err) {
    next(err);
  }
}

async function crearEmpleado(req, res, next) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      const err = new Error('nombre, email y password son requeridos');
      err.status = 400;
      throw err;
    }

    const existente = await Usuario.findByEmail(email);
    if (existente) {
      const err = new Error('El email ya está registrado');
      err.status = 409;
      throw err;
    }

    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    const id = await Usuario.crear(nombre, email, hash, 'empleado');

    res.status(201).json({ id, nombre, email, rol: 'empleado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { agendaGeneral, crearServicio, crearProfesional, listarEmpleadosSinPerfil, crearEmpleado };



// modified

// modified

// modified
