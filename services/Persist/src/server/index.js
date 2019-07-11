const app = require('../../app.js');
const sequelize = require('../config').getClient();
const config = require('../config');
//connects to db
sequelize
  .sync()
  .then(async () => {
    console.log('connected to PGDB'); // NOTE: comment out when testing
  })
  .catch(error => {
    console.error(`sequelize sync error: ${error}`);
  });
app.listen(config.port, error => {
  console.log(error ? error : `Listening on port ${config.port}`);
});
