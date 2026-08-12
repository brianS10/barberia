const router = require('express').Router();
const ctrl = require('../controllers/admin');
const { verificarToken, requiereRol } = require('../middleware/auth');

router.use(verificarToken, requiereRol('admin'));

router.get('/agenda-general', ctrl.agendaGeneral);
router.post('/servicios', ctrl.crearServicio);
router.post('/profesionales', ctrl.crearProfesional);

module.exports = router;

// modified
