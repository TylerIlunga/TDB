module.exports = {
  persist_base: `http://${process.env.PERSIST_BASE || 'localhost'}:3333`,
  port: process.env.PORT || 7654,
};
