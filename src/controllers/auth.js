const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

async function registro(req, res, next) {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      const err = new Error('Nombre, email y password son requeridos');
      err.status = 400;
      throw err;
    }

    const existente = await Usuario.findByEmail(email);
    if (existente) {
      const err = new Error('El email ya está registrado');
      err.status = 409;
      throw err;
    }

    const hash = await bcrypt.hash(password, 10);
    const id = await Usuario.crear(nombre, email, hash);

    const accessToken = generarAccessToken({ id, email, rol: 'cliente' });
    const refreshToken = generarRefreshToken({ id });

    res.status(201).json({ id, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = new Error('Email y password son requeridos');
      err.status = 400;
      throw err;
    }

    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      const err = new Error('Credenciales incorrectas');
      err.status = 401;
      throw err;
    }

    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) {
      const err = new Error('Credenciales incorrectas');
      err.status = 401;
      throw err;
    }

    const accessToken = generarAccessToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    });
    const refreshToken = generarRefreshToken({ id: usuario.id });

    res.json({ accessToken, refreshToken, rol: usuario.rol });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      const err = new Error('Refresh token requerido');
      err.status = 400;
      throw err;
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      const err = new Error('Refresh token inválido');
      err.status = 401;
      throw err;
    }

    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.status = 401;
      throw err;
    }

    const accessToken = generarAccessToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

function generarAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
}

function generarRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
}

module.exports = { registro, login, refresh };

// modified

// modified
