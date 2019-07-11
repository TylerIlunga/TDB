const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const eSession = require('express-session');
const logger = require('morgan');
const routes = require('./src/routes');

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'],
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(logger('dev'));
const sessionStore = new eSession.MemoryStore();
app.use(
  eSession({
    name: 'search_sid',
    cookie: {
      maxAge: new Date().getTime() + 60 * 60 * 1000,
      httpOnly: false,
    },
    store: sessionStore,
    saveUninitialized: false,
    resave: true,
    secret: 'S_SECRET',
  }),
);
app.use('/', routes);

module.exports = app;
