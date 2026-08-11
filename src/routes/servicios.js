const router = require('express').Router();
const ctrl = require('../controllers/servicios');

router.get('/', ctrl.listar);

module.exports = router;
