const router = require('express').Router();
const { list, query, create, update, discard } = require('../controllers');

router.get('/api/search/questions/list', list);
router.get('/api/search/questions/query', query);
router.post('/api/search/questions/create', create);
router.put('/api/search/questions/update', update);
router.delete('/api/search/questions/discard', discard);

module.exports = router;
