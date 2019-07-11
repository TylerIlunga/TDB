const app = require('../../app.js');
const config = require('../config');
app.listen(config.port, error => {
  console.log(error ? error : `Listening on port ${config.port}`);
});
