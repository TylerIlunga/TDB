const router = require('express').Router();
const {
    signup,
    resetPassword,
    resend
} = require('../controllers');

router.post('/api/search/email/signup', signup);
router.post('/api/search/email/resetPassword', resetPassword);
router.post('/api/search/email/resend', resend);

module.exports = router;