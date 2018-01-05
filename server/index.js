const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const httpsRedirect = require('express-https-redirect');
const fallback = require('express-history-api-fallback');
const helmet = require('helmet');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const bookshelf = require('./database/index');

const logger = require('./util/logger');
const accessLogger = require('./util/access-logger');
const authConfig = require('./config/auth');
const mailingConfig = require('./config/mailing');
const Mailing = require('./controllers/mailing');
// eslint-disable-next-line no-unused-vars
const models = require('./models'); // We load all the models for the registry
const migrate = require('./database/migrate');
const routes = require('./routes/index');
const authControllers = require('./controllers/auth');

const publicPath = path.join(__dirname, 'public');

module.exports = () => {
  const app = express();
  app.locals.bookshelf = bookshelf;
  return migrate(bookshelf).then(() => {
    app.use(morgan('combined', { stream: accessLogger.stream }));
    if (process.env.NODE_ENV === 'production') app.use('/', httpsRedirect());
    app.use(helmet());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    // Setup global conf for mailing so we can call this instance from any handler
    app.locals.mailing = new Mailing(mailingConfig);

    // Setup global logger
    app.locals.logger = logger;

    app.use(express.static(publicPath));
    app.use('/', routes);
    app.use(fallback('index.html', { root: publicPath }));

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
      const err = new Error('Not Found');
      err.status = 404;
      res.status(err.status);
      next(err);
    });

    passport.use(new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          ExtractJwt.fromAuthHeaderAsBearerToken(),
          ExtractJwt.fromUrlQueryParameter('token'),
        ]),
        secretOrKey: authConfig.authSecret,
        maxAge: authConfig.authTimeout,
      },
      authControllers.authenticate,
    ));

    // error handler for any uncaught error
    app.use((err, req, res, next) => {
      // set locals, only providing error in development
      logger.error(err);
      const status = err.status || 500;
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      // render the error page
      res.status(status);
      res.json({ status, msg: err.message });
    });
    return app;
  });
};
