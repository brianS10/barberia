const router = require('express').Router();
const ctrl = require('../controllers/empleado');
const { verificarToken, requiereRol } = require('../middleware/auth');

router.use(verificarToken, requiereRol('empleado', 'admin'));

router.get('/agenda', ctrl.miAgenda);
router.post('/bloqueos', ctrl.crearBloqueo);
router.delete('/bloqueos/:id', ctrl.eliminarBloqueo);

module.exports = router;

// modified
