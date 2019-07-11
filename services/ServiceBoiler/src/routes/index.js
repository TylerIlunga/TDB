const router = require('express').Router();
const { retrieve, verify, update, reset, snapshot } = require('../controllers');

router.get('/api/account/retrieve', retrieve);
router.get('/api/account/verify', verify);
router.put('/api/account/update', update);
router.put('/api/account/reset', reset);
router.get('/api/account/snapshot', snapshot);

module.exports = router;
