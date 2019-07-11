const {
  sendEmail
} = require('../config');
const getWelcomeHtml = require('../static/welcome');
const getForgotPasswordHtml = require('../static/forgot');
const Errors = require('../../tools/Common/Errors');

module.exports = {
  signup(req, res) {
    console.log('req.body', req.body);
    if (!(req.body && req.body.user)) {
      return Errors.Network.missingFields(res);
    }
    const {
      user
    } = req.body;
    sendEmail(
        'support@puro.com',
        user.email,
        'Activate your account!',
        getWelcomeHtml(user),
      )
      .then(success => {
        console.log('email sent!');
        return res.json({
          success: true,
          user
        });
      })
      .catch(error => {
        console.log(`signup error: ${error}`);
        return res.json({
          error: 'Error sending activation email, please contact support@puro.com',
          success: false,
        });
      });
  },
  resetPassword(req, res) {
    sendEmail(
        'support@puro.com',
        req.body.email,
        'Reset your password!',
        getForgotPasswordHtml({
          passwordResetToken: req.body.passwordResetToken,
          email: req.body.email,
        }),
      )
      .then(success => {
        console.log('email sent!');
        return res.json({
          success: 'An email has been sent with instructions!',
          error: null,
        });
      })
      .catch(error => {
        console.log(`signup error: ${error}`);
        return res.json({
          error: 'Error sending reset email, please contact support@puro.com',
          success: false,
        });
      });
  },
  resend(req, res) {
    // https://aws.amazon.com/ses/pricing/
    sendEmail(
        'support@puro.com',
        req.body.user.email,
        'Activate your account!',
        getWelcomeHtml(req.body.user),
      )
      .then(success => {
        console.log('email sent!');
        return res.json({
          success: true,
          error: false
        });
      })
      .catch(error => {
        console.log(`signup error: ${error}`);
        return res.json({
          error: 'Error sending activation email, please contact support@puro.com',
          success: false,
        });
      });
  }
};