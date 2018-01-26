const userController = require('../../controllers/users');
const authController = require('../../controllers/auth');

module.exports = {
  post: [
    (req, res, next) =>
      userController
        .post({ email: req.body.email })
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
        return userController.get({ email: req.body.email }, [{ auth: (qb) => { qb.andWhere('auth.role', 'basic'); } }])
          .then((user) => {
            /*  eslint-disable max-len */
            /*  
            * bookshelf query system works into mostly individual queries
            * : user, auth and project are "assembled" into a result
            * hence, user's project may be empty, but auth will not exists if the user's auth is not basic
            */ 
            /*  eslint-enable max-len */
            // Only a user with an existing token can continue (owner)
            if (user.auth && user.auth.id) {
              return authController.refresh(user.auth.id)
                .then((auth) => {
                  return req.app.locals.mailing
                    .sendReturningAuthEmail(user.email, req.body.eventSlug, auth.token);
                })
                .then(() => next()) // 409 status is carried on
                .catch(next);
            }
            // The requested user is not allowed to log-in
            res.locals.err.status = 401;
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
