module.exports = {
  API_KEY: 'sdsdjklndscsd',
  jwt: {
    J_SECRET: 'sdnsdjlcndsjkl',
  },
  email_service_base: `http://${process.env.EMAIL_BASE || 'localhost'}:2222`,
  persist_base: `http://${process.env.PERSIST_BASE || 'localhost'}:3333`,
  web_base: `http://${process.env.WEB_BASE || 'localhost'}:3000`,
  port: process.env.PORT || 4444,
  S_SECRET: 'dsd39239sdao',
};
