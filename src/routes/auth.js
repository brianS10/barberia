const router = require('express').Router();
const ctrl = require('../controllers/auth');

router.post('/registro', ctrl.registro);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);

module.exports = router;

// modified

// modified
