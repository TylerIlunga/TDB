const router = require('express').Router();
const {
  signup,
  login,
  logout,
  verifyAccount,
  resendEmail,
  handleTFA,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  deleteAccount,
  middleware,
} = require('../controllers');

router.post('/api/search/auth/signup', signup);
router.post('/api/search/auth/login', login);
router.get('/api/search/auth/logout', logout);
router.get('/api/search/auth/verifyAccount', verifyAccount);
router.get('/api/search/auth/resendEmail', resendEmail);
router.get('/api/search/auth/handleTFA', handleTFA);
router.post('/api/search/auth/forgotPassword', forgotPassword);
router.post('/api/search/auth/resetPassword', resetPassword);
router.get('/api/search/auth/verifyResetToken', verifyResetToken);
router.delete('/api/search/auth/deleteAccount', deleteAccount);

module.exports = router;
