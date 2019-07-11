const router = require('express').Router();
const { Auth, Questions } = require('../controllers');

/* Auth Layer */
router.post('/api/search/persist/auth/signup', Auth.signup);
router.post('/api/search/persist/auth/query', Auth.query);
router.put('/api/search/persist/auth/update', Auth.update);
router.delete('/api/search/persist/auth/delete', Auth.delete);

/* Questions Layer */
router.get('/api/persist/questions/list', Questions.list);
router.get('/api/persist/questions/query', Questions.query);
router.post('/api/persist/questions/store', Questions.store);
router.put('/api/persist/questions/update', Questions.update);
router.delete('/api/persist/questions/delete', Questions.delete);

module.exports = router;
