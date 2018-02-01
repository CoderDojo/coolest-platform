const { find } = require('lodash');
const userController = require('../../controllers/users');
const authController = require('../../controllers/auth');

module.exports = {
  post: [
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
                .sendReturningAuthEmail(user.email, req.body.eventSlug, auth.token);
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
};
