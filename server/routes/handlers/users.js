const userController = require('../../controllers/users');
const authController = require('../../controllers/auth');

module.exports = {
  post: [
    (req, res, next) =>
      userController
        .post(req.body.email)
        .then((user) => {
          res.locals.user = user;
          return next();
        })
        .catch((err) => {
          res.locals.err = err;
          return next();
        }),
    (req, res, next) => {
      if (res.locals.err && res.locals.err.status === 409) {
        return userController.get({ email: req.body.email }, ['project', 'auth'])
          .then((user) => {
            if (user.project.length <= 0) {
              delete res.locals.err;
              return authController.refresh(user.auth.id)
                .then((auth) => {
                  delete user.auth;
                  delete user.project;
                  res.locals.user = { user, auth };
                  return Promise.resolve();
                })
                .then(() => next());
            }
            return next();
          });
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
