// Middleware central de errores.
// Los controllers pueden lanzar un error con .status para indicar el código HTTP,
// o simplemente dejar que errores inesperados caigan aquí con 500.
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.status ? err.message : 'Error interno del servidor';

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;

// modified

// modified

// modified

// modified

// modified
