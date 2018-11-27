const { find } = require('lodash');
const userController = require('../../controllers/users');
const authController = require('../../controllers/auth');
const eventController = require('../../controllers/events');

module.exports = {
  post: [
    (req, res, next) =>
      eventController.get({ slug: req.body.eventSlug })
        .then((event) => {
          res.locals.event = event;
          next();
        }),
    (req, res, next) =>
      /*  
       * bookshelf query system works into mostly individual queries
       * : user and auth are "assembled" into a result meaning
       * we will get all matching users, regardless of whether they have an auth
       */
      userController
        .getAll({ email: req.body.email }, ['auth'])
        .then((users) => {
          res.locals.user = find(users, user => !!(user.auth && user.auth.role === 'basic'));
          res.locals.admin = find(users, user => !!(user.auth && user.auth.role === 'admin'));
          next();
        }),
    (req, res, next) => {
      if (res.locals.user || res.locals.admin) {
        res.locals.err = new Error('Error while saving a user.');
        res.locals.err.status = res.locals.user ? 409 : 401;
        return next();
      }
      return userController
        .post({ email: req.body.email })
        .then((user) => {
          res.locals.user = user;
          return next();
        })
        .catch((err) => {
          res.locals.err = err;
          return next();
        });
    },
    (req, res, next) => {
      if (res.locals.err && res.locals.err.status === 409) {
        const user = res.locals.user;
        // Only a user with an existing token can continue (owner)
        if (user.auth && user.auth.id) {
          return authController.refresh(user.auth.id)
            .then((auth) => {
              return req.app.locals.mailing
                .sendReturningAuthEmail(user.email, res.locals.event.attributes, auth.token);
            })
            .then(() => next()) // 409 status is carried on
            .catch(() => {
              res.locals.err.status = 500;
              next();
            });
        }
      }
      return next();
    },
    (req, res, next) => {
      if (res.locals.err) {
        req.app.locals.logger.error(res.locals.err);
        const err = new Error('Error while saving a user.');
        err.status = res.locals.err.status || 500;
        return next(err);
      }
      res.status(200).json(res.locals.user);
    },
  ],
  getAll: [
    (req, res) => {
      req.query.query = req.query.query || {};
      return userController
        .getExtended(req.query)
        .then(users => res.status(200).json({
          data: users.models,
          count: users.pagination.rowCount,
        }));
    },
  ],
  postAdmin: [
    (req, res, next) => {
      return userController
        .post({ email: req.body.email }, { role: 'admin', password: req.body.password })
        .then((user) => {
          return next();
        })
        .catch((err) => {
          return res.sendStatus(500);
        });
    },
    (req, res, next) => {
      return req.app.locals.mailing.sendNewAdminEmail(req.body.email, req.body.password)
      .then(() => {
        return res.sendStatus(200);
      });
    },
  ],
};
