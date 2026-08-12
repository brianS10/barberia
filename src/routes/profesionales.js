const router = require('express').Router();
const ctrl = require('../controllers/profesionales');

router.get('/', ctrl.listar);
router.get('/:id/disponibilidad', ctrl.disponibilidad);

module.exports = router;

// modified
