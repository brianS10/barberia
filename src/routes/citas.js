const router = require('express').Router();
const ctrl = require('../controllers/citas');
const { verificarToken } = require('../middleware/auth');

router.post('/', verificarToken, ctrl.agendar);
router.get('/mias', verificarToken, ctrl.misCitas);
router.patch('/:id/cancelar', verificarToken, ctrl.cancelar);

module.exports = router;

// modified

// modified

// modified

// modified
