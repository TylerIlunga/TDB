const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
// const { Pool } = require('pg');
//db should have a hash password for prod

const dbConfig = {
  user: process.env.PG_USER || 'tilios',
  host: process.env.PG_HOST || '127.0.0.1',
  password: process.env.PG_PASS || null,
  database: process.env.PG_DB || 'lune_search_dev',
  port: process.env.PG_PORT || 5432,
  pool: {
    max: 20,
    min: 1,
    idle: 10000,
  },
  dialect: 'postgres',
};

const poolConfig = {
  user: process.env.PG_USER || 'tilios',
  host: process.env.PG_HOST || '127.0.0.1',
  password: process.env.PG_PASS || null,
  database: process.env.PG_DB || 'lune_search_dev',
  port: process.env.PG_PORT || 5432,
  max: 20,
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    operatorsAliases: Sequelize.Op,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: 30000,
      idle: dbConfig.pool.idle,
    },
    logging: psqlCommand => {
      console.log(`PSQL:::: ${psqlCommand}\n`);
    }, // NOTE: false when testing
  },
);

const models = {
  Answer: require('../models/Answer')(sequelize),
  Question: require('../models/Question')(sequelize),
  Topic: require('../models/Topic')(sequelize),
  Subject: require('../models/Subject')(sequelize),
  User: require('../models/User')(sequelize),
  Coin: require('../models/Coin')(sequelize),
};

Object.keys(models).forEach(key => {
  console.log(key); // NOTE: comment out when testing
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

const genericConfiguration = {
  API_KEY: 'dsdISNDSKcdjs',
  port: process.env.PORT || 3333,
  email_api_base: `http://${process.env.EMAIL_BASE || 'localhost'}:2222`,
  getClient: () => sequelize,
};

const authOperations = {
  genid() {
    var text = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },
  genPassword(password) {
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(err);
        }
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            return reject(err);
          }
          return resolve(hash);
        });
      });
    });
  },
};

module.exports = {
  ...models,
  ...genericConfiguration,
  ...authOperations,
};
