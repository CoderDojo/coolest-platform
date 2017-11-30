const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const protect = require('@risingstack/protect');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bookshelf = require('./database/index');

const logger = require('./util/logger');
const authConfig = require('./config/auth');
// eslint-disable-next-line no-unused-vars
const models = require('./models'); // We load all the models for the registry
const migrate = require('./database/migrate');
const routes = require('./routes/index');
const authHandlers = require('./routes/handlers/auth');

const app = express();
// uncomment after placing your favicon in /public
migrate(bookshelf).then(() => {
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(morgan('combined', { stream: logger.stream }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', routes);
  app.get('/coffee', (req, res) => {
    res.statusMessage = "I'm a teapot";
    res
      .status(418)
      .json({ message: "I'm a teapot", image: 'https://httpstatusdogs.com/img/418.jpg' });
  });

  app.use(protect.express.sqlInjection({
    body: true,
    loggerFunction: logger.error,
  }));

  app.use(protect.express.xss({
    body: true,
    loggerFunction: logger.error,
  }));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    res.status(err.status);
    next(err);
  });

  passport.use(new JwtStrategy({
    jwtFromRequest:
    ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromUrlQueryParameter('token'),
    ]),
    secretOrKey: authConfig.authSecret,
    maxAge: authConfig.authTimeout,
  }, authHandlers.authenticate));

  // error handler for any uncaught error
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    const status = err.status || 500;
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(status);
    res.json({ status, msg: err.message });
  });
});

module.exports = app;
