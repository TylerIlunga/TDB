const nodemailer = require('nodemailer');
const MAILGUN_USER =
  'postmaster@sandbox0857439581d64765917da23955d3b233.mailgun.org';
const MAILGUN_PASS = '04705f7d9c83ed9bcd196bdc3394d1ba-985b58f4-2f63e9c6';

const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: MAILGUN_USER,
    pass: MAILGUN_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
module.exports = {
  auth_base: `http://${process.env.AUTH_BASE || 'localhost'}:4444`,
  port: process.env.PORT || 2222,
  sendEmail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
      transporter.sendMail({ from, subject, to, html }, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });
  },
};
