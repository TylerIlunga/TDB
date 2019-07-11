const {
  auth_base
} = require('../config');
module.exports = user => {
  return `
    Welcome to Puro!
    <br/><br/>
    We are really excited to give you more insight on your audience!
    <br/><br/>
    <a href="${auth_base}/api/search/auth/verifyAccount?token=${
    user.activation_token
  }&email=${user.email}">
      Click here to verify your account!
    </a>
    <br/><br/>
    <b>Puro Team</b>
  `;
};