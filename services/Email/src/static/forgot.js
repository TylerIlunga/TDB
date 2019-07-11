const {
  auth_base
} = require('../config');
module.exports = user => {
  return `
    <a href="${auth_base}/api/search/auth/resetPassword?token=${user.passwordResetToken}&email=${
    user.email
  }">
      Click here to change your password!
    </a>
    <br/><br/>
    <b>Puro Team</b>
  `;
};